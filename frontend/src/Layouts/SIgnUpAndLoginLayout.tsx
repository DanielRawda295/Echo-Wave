import { Sidebar, Searchbar, TopPlay, MusicPlayer, Toasts } from '../components';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import ChatbotWidget from '../components/ChatbotWidget';

const MusicLayout = ({ children }: { children: React.ReactNode }) => {
  const { activeSong } = useSelector((state: RootState) => state.player);
  const hasPlayer = Boolean(activeSong?.title);

  return (
    <div className="music-shell flex h-dvh min-h-0 flex-col overflow-hidden bg-[#101020] md:flex-row">
      <Toasts />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-linear-to-br from-[#11111d] to-[#171737]">
        <Searchbar />
        <div className="music-content flex min-h-0 flex-1 gap-8 overflow-y-auto px-4 pt-2 sm:px-6 xl:flex-row">
          <main id="main-content" className="min-w-0 flex-1" style={{ paddingBottom: hasPlayer ? 176 : 88 }}>
            {children}
          </main>
          <aside aria-label="Charts and artists" className="hidden h-fit w-80 shrink-0 xl:sticky xl:top-0 xl:block">
            <TopPlay />
          </aside>
        </div>
      </div>
      <ChatbotWidget bottomOffsetPx={hasPlayer ? 156 : 20} rightOffsetPx={16} />
      {hasPlayer && <MusicPlayer />}
    </div>
  );
};
export default MusicLayout;
