import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

type Role = 'system' | 'user' | 'assistant';
type Message = { role: Role; content: string };

type KnowledgeChunk = {
  id: string;
  source: string;
  text: string;
  tokens: string[];
};

const BUILTIN_KNOWLEDGE = `
EchoWave app guide

EchoWave is a music web app with:
- Discover / Top Charts / Top Artists (iTunes-based browsing)
- Song playback with a global player (preview URLs)
- Favorites
- Playlists (create, rename, reorder, remove items)
- Community uploads (upload an mp3 + optional cover and publish)
- Community engagement (likes + comments on uploaded tracks)

Playing music
- Click play on a song card to start playback in the bottom player.

Favorites
- Tap the heart icon on a song card to add/remove it from Favorites.

Playlists
- Create playlists from the Playlists page.
- Add songs using the “Add to playlist” action.
- In playlist details you can play, shuffle, rename, reorder and remove songs.

Uploading songs (Community)
- Use Upload to publish an mp3 from your device.
- Required: title, artist, genre, and an mp3 file. Optional: cover image.

Account
- Update username/email/password and avatar, logout, or deactivate account.
`.trim();

function tokenize(text: string): string[] {
  const stop = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'to',
    'of',
    'in',
    'on',
    'for',
    'with',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'it',
    'this',
    'that',
    'i',
    'you',
    'we',
    'they',
    'he',
    'she',
    'them',
    'my',
    'your',
    'our',
    'their',
    'as',
    'at',
    'by',
    'from',
    'how',
    'what',
    'why',
    'who',
    'when',
  ]);

  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !stop.has(t))
    .slice(0, 200);
}

function splitIntoChunks(text: string): string[] {
  const cleaned = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const parts = cleaned.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';

  for (const p of parts) {
    const candidate = buffer ? `${buffer}\n\n${p}` : p;
    if (candidate.length <= 800) {
      buffer = candidate;
    } else {
      if (buffer) chunks.push(buffer);
      buffer = p.length <= 800 ? p : p.slice(0, 800);
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks.slice(0, 60);
}

@Injectable()
export class ChatService {
  private cachedChunks: KnowledgeChunk[] | null = null;

  private systemPrompt(): string {
    return [
      "You are EchoWave's assistant.",
      'You help users with music questions and with using the EchoWave app.',
      'If the user asks about the app, answer using the provided CONTEXT.',
      'You do NOT use external AI providers. You only answer about EchoWave features and how to use the site.',
      'If you are unsure, say so and suggest where the user can find the feature in the app.',
    ].join(' ');
  }

  private normalizeHistory(history: Message[] | undefined): Message[] {
    return (history || [])
      .filter((m) => typeof m?.content === 'string' && m.content.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  private loadKnowledge(): KnowledgeChunk[] {
    if (this.cachedChunks) return this.cachedChunks;

    const chunks: KnowledgeChunk[] = [];

    splitIntoChunks(BUILTIN_KNOWLEDGE).forEach((text, idx) => {
      chunks.push({
        id: `builtin:${idx}`,
        source: 'builtin',
        text,
        tokens: tokenize(text),
      });
    });

    const knowledgeDir = join(__dirname, 'knowledge');
    if (existsSync(knowledgeDir)) {
      const files = readdirSync(knowledgeDir)
        .filter((f) => f.toLowerCase().endsWith('.md'))
        .map((f) => join(knowledgeDir, f));

      for (const file of files) {
        let content = '';
        try {
          content = readFileSync(file, 'utf8');
        } catch {
          continue;
        }
        const basename = file.split(/[\\/]/).pop() || file;
        const parts = splitIntoChunks(content);
        parts.forEach((text, idx) => {
          chunks.push({
            id: `${basename}:${idx}`,
            source: basename,
            text,
            tokens: tokenize(text),
          });
        });
      }
    }

    this.cachedChunks = chunks;
    return chunks;
  }

  private retrieveContext(query: string): { context: string; sources: string[] } {
    const qTokens = tokenize(query);
    if (qTokens.length === 0) return { context: '', sources: [] };

    const chunks = this.loadKnowledge();
    if (!chunks.length) return { context: '', sources: [] };

    const qSet = new Set(qTokens);
    const scored = chunks
      .map((c) => {
        let overlap = 0;
        for (const t of c.tokens) if (qSet.has(t)) overlap++;
        return { c, score: overlap };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const sources = Array.from(new Set(scored.map((s) => s.c.source)));
    const context = scored.map((s) => `SOURCE: ${s.c.source}\n${s.c.text}`).join('\n\n---\n\n');
    return { context, sources };
  }

  private pickIntent(message: string): string {
    const text = String(message || '').toLowerCase();
    if (!text.trim()) return 'empty';

    const has = (...words: string[]) => words.some((w) => text.includes(w));

    if (has('hello', 'hi', 'hey', 'good morning', 'good evening')) return 'greeting';
    if (has('playlist', 'playlists')) return 'playlists';
    if (has('upload', 'publish', 'my uploads')) return 'upload';
    if (has('community', 'comment', 'comments')) return 'community';
    if (has('like', 'likes', 'heart', 'favorite', 'favourite')) return 'favorites';
    if (has('play', 'pause', 'player', 'song won', 'preview')) return 'player';
    if (has('search', 'find', 'look for')) return 'search';
    if (has('account', 'profile', 'username', 'email', 'password', 'logout', 'deactivate')) return 'account';

    return 'unknown';
  }

  private formatSteps(lines: string[]) {
    return lines.map((l) => `- ${l}`).join('\n');
  }

  private buildReply(message: string) {
    const intent = this.pickIntent(message);
    const { context } = this.retrieveContext(message);

    if (intent === 'empty') {
      return "Ask me how to use EchoWave (playlists, uploading songs, favorites, community, account settings).";
    }

    if (intent === 'greeting') {
      return "Hi! I can help you with EchoWave features like playlists, uploads, favorites, community, and account settings. What do you want to do?";
    }

    if (intent === 'playlists') {
      return [
        'Playlists help',
        this.formatSteps([
          'Go to Playlists to create a new playlist',
          'Use “Add to playlist” on a song to add it',
          'Open a playlist to play all / shuffle, rename, reorder, or remove songs',
        ]),
      ].join('\n');
    }

    if (intent === 'upload') {
      return [
        'Uploading songs (Community)',
        this.formatSteps([
          'Go to Upload',
          'Fill title, artist, genre and select an mp3 file',
          'Optionally add a cover image',
          'Submit, then find it in Community / My Uploads',
        ]),
      ].join('\n');
    }

    if (intent === 'favorites') {
      return [
        'Favorites help',
        this.formatSteps([
          'Tap the heart on a song card to add/remove favorites',
          'Open Favorites page to see your saved songs',
        ]),
      ].join('\n');
    }

    if (intent === 'community') {
      return [
        'Community help',
        this.formatSteps([
          'Open Community to browse uploaded songs',
          'Open a song to view details, like it, and add comments',
        ]),
      ].join('\n');
    }

    if (intent === 'player') {
      return [
        'Player help',
        this.formatSteps([
          'Click play on any song card to start playback in the bottom player',
          'Use pause/next/previous controls in the player',
        ]),
      ].join('\n');
    }

    if (intent === 'search') {
      return [
        'Search help',
        this.formatSteps([
          'Use the top search bar to search for songs/artists',
          'On the Search page you can switch between iTunes and Community results',
        ]),
      ].join('\n');
    }

    if (intent === 'account') {
      return [
        'Account help',
        this.formatSteps([
          'Open Account to view your profile info and avatar',
          'Use the buttons to update username, email, or password',
          'Use logout to return to the login page',
        ]),
      ].join('\n');
    }

    if (context) {
      return [
        'Here is what I found in the EchoWave help:',
        context.split('\n').slice(0, 18).join('\n'),
        '',
        "If you tell me what page you're on, I can guide you step-by-step.",
      ].join('\n');
    }

    return [
      "I can help with EchoWave features (playlists, uploads, favorites, community, account, search, player).",
      "Ask something like: “How do I upload a song?” or “How do I add a song to a playlist?”",
    ].join('\n');
  }

  async chat(opts: { message: string; history?: Message[] }) {
    try {
      return this.buildReply(opts.message);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new InternalServerErrorException(`Chatbot failed: ${msg}`);
    }
  }
}
