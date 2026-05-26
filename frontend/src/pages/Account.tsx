import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

type MeResponse = {
  id: number;
  email: string;
  username?: string | null;
  avatar?: string | null;
  role?: string | null;
  createdAt?: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function Account() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [usernameState, setUsernameState] = useState<SaveState>('idle');
  const [emailState, setEmailState] = useState<SaveState>('idle');
  const [avatarState, setAvatarState] = useState<SaveState>('idle');
  const [passwordState, setPasswordState] = useState<SaveState>('idle');
  const [passwordToast, setPasswordToast] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateConfirmPassword, setDeactivateConfirmPassword] = useState('');
  const [deactivateState, setDeactivateState] = useState<SaveState>('idle');
  const [deactivateError, setDeactivateError] = useState('');

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const avatarUrl = useMemo(() => me?.avatar || '', [me]);
  const displayName = useMemo(() => me?.username || me?.email?.split('@')?.[0] || 'User', [me]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setLoadError('');
        const res = await api.get('/users/me');
        if (!active) return;
        const next = res.data as MeResponse;
        setMe(next);
        setUsername(next.username || '');
        setEmail(next.email || '');
        setAvatar(next.avatar || '');
      } catch (err: any) {
        if (!active) return;
        const msg =
          err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load profile';
        setLoadError(String(msg));
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function saveUsername() {
    setUsernameState('saving');
    setUsernameError('');
    try {
      const res = await api.patch('/users/me', { username });
      setMe(res.data);
      setUsernameState('saved');
      showToast('Username updated');
      window.setTimeout(() => setUsernameState('idle'), 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update username';
      setUsernameError(String(msg));
      setUsernameState('error');
    }
  }

  async function saveEmail() {
    setEmailState('saving');
    setEmailError('');
    try {
      const res = await api.patch('/users/me', { email });
      setMe(res.data);
      setEmailState('saved');
      showToast('Email updated');
      window.setTimeout(() => setEmailState('idle'), 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update email';
      setEmailError(String(msg));
      setEmailState('error');
    }
  }

  async function saveAvatar() {
    setAvatarState('saving');
    setAvatarError('');
    try {
      const res = await api.patch('/users/me', { avatar });
      setMe(res.data);
      setAvatarState('saved');
      showToast('Avatar updated');
      window.setTimeout(() => setAvatarState('idle'), 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update avatar';
      setAvatarError(String(msg));
      setAvatarState('error');
    }
  }

  async function savePassword() {
    setPasswordState('saving');
    setPasswordError('');
    try {
      await api.post('/users/me/password', {
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordState('saved');
      showToast('Password changed successfully');
      window.setTimeout(() => {
        setPasswordState('idle');
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password';
      setPasswordError(String(msg));
      setPasswordState('error');
    }
  }

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 2500);
  }

  if (loading) {
    return <div className="text-white/80">Loading account…</div>;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-lg font-semibold">Could not load account</div>
        <div className="mt-2 text-sm text-white/80">{loadError}</div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">Account</h2>
          <p className="text-sm text-white/70 mt-1">Manage your profile and security</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            onClick={() => {
              setConfirmLogoutOpen(true);
            }}
          >
            Logout
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600/90 px-4 py-2 text-sm text-white hover:bg-red-600"
            onClick={() => {
              setDeactivateError('');
              setDeactivatePassword('');
              setDeactivateConfirmPassword('');
              setDeactivateState('idle');
              setDeactivateOpen(true);
            }}
          >
            Deactivate account
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/60">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-white">{displayName}</div>
            <div className="truncate text-sm text-white/70">{me.email}</div>
            <div className="mt-1 text-xs text-white/60">
              {me.role ? `Role: ${me.role}` : null}
              {me.createdAt ? ` • Joined: ${new Date(me.createdAt).toLocaleDateString()}` : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Change username</div>
          <div className="mt-1 text-sm text-white/70">Pick a display name shown across the app.</div>

          <input
            className="mt-4 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />

          {usernameError && <div className="mt-3 text-sm text-red-300">{usernameError}</div>}

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            disabled={usernameState === 'saving' || username.trim().length < 2}
            onClick={saveUsername}
          >
            {usernameState === 'saving' ? 'Saving…' : usernameState === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Change email</div>
          <div className="mt-1 text-sm text-white/70">Used for login and account recovery.</div>

          <input
            className="mt-4 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />

          {emailError && <div className="mt-3 text-sm text-red-300">{emailError}</div>}

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            disabled={emailState === 'saving' || !email.trim()}
            onClick={saveEmail}
          >
            {emailState === 'saving' ? 'Saving…' : emailState === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Profile picture</div>
          <div className="mt-1 text-sm text-white/70">Paste an image URL to use as your avatar.</div>

          <input
            className="mt-4 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://…"
          />

          {avatarError && <div className="mt-3 text-sm text-red-300">{avatarError}</div>}

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            disabled={avatarState === 'saving'}
            onClick={saveAvatar}
          >
            {avatarState === 'saving' ? 'Saving…' : avatarState === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Change password</div>
          <div className="mt-1 text-sm text-white/70">
            Use a strong password (8+ chars, uppercase, lowercase, number, special character).
          </div>

          <input
            className="mt-4 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            type="password"
          />
          <input
            className="mt-3 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
          />

          {passwordError && <div className="mt-3 text-sm text-red-300">{passwordError}</div>}

          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          disabled={passwordState === 'saving' || newPassword.length < 8}
          onClick={savePassword}
          >
            {passwordState === 'saving' ? 'Saving...' : passwordState === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {deactivateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onMouseDown={() => setDeactivateOpen(false)}
          role="dialog"
          aria-label="Deactivate account"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b18]/95 p-6 text-white shadow-2xl backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold">Deactivate account</div>
            <div className="mt-2 text-sm text-white/70">
              This permanently disables your account. You will be logged out and redirected to the login page.
            </div>

            <div className="mt-5">
              <label className="text-sm text-white/80">Password</label>
              <input
                className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-red-500"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm text-white/80">Confirm password</label>
              <input
                className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-red-500"
                value={deactivateConfirmPassword}
                onChange={(e) => setDeactivateConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                type="password"
              />
            </div>

            {deactivateError && <div className="mt-3 text-sm text-red-300">{deactivateError}</div>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                onClick={() => setDeactivateOpen(false)}
                disabled={deactivateState === 'saving'}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-50"
                disabled={
                  deactivateState === 'saving' ||
                  !deactivatePassword ||
                  deactivatePassword !== deactivateConfirmPassword
                }
                onClick={async () => {
                  setDeactivateError('');
                  setDeactivateState('saving');
                  try {
                    await api.post('/users/me/deactivate', {
                      password: deactivatePassword,
                      confirmPassword: deactivateConfirmPassword,
                    });
                    // Successfully deactivated: clear session and force navigation to login
                    logout();
                    setDeactivateOpen(false);
                    navigate('/login', { replace: true });
                    window.location.replace('/login');
                  } catch (err: any) {
                    const msg =
                      err?.response?.data?.message?.message ||
                      err?.response?.data?.message ||
                      err?.message ||
                      'Failed to deactivate account';
                    setDeactivateError(String(msg));
                    setDeactivateState('error');
                  }
                }}
              >
                {deactivateState === 'saving' ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLogoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onMouseDown={() => setConfirmLogoutOpen(false)}
          role="dialog"
          aria-label="Confirm logout"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b18]/95 p-6 text-white shadow-2xl backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold">Logout</div>
            <div className="mt-2 text-sm text-white/70">
              Are you sure you want to logout?
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                onClick={() => setConfirmLogoutOpen(false)}
              >
                No
              </button>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                onClick={() => {
                  setConfirmLogoutOpen(false);
                  logout();
                  navigate('/login', { replace: true });
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/40">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
