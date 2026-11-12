import { useEffect, useRef, useState, type ElementType } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHashtag, HiOutlineHome, HiOutlineMenu, HiOutlinePhotograph, HiOutlineUserGroup } from 'react-icons/hi';
import { FiClock, FiHeart, FiList, FiMusic, FiUploadCloud, FiUser, FiUsers, FiX } from 'react-icons/fi';
import { logo } from '../assets';

const links: { name: string; to: string; icon: ElementType }[] = [
  { name: 'Discover', to: '/', icon: HiOutlineHome },
  { name: 'Community', to: '/community', icon: FiUsers },
  { name: 'Top Charts', to: '/top-charts', icon: HiOutlineHashtag },
  { name: 'Top Artists', to: '/top-artists', icon: HiOutlineUserGroup },
  { name: 'Around You', to: '/around-you', icon: HiOutlinePhotograph },
  { name: 'Favorites', to: '/favorites', icon: FiHeart },
  { name: 'Playlists', to: '/playlists', icon: FiList },
  { name: 'Recently Played', to: '/recently-played', icon: FiClock },
  { name: 'Upload', to: '/upload', icon: FiUploadCloud },
  { name: 'My Uploads', to: '/my-uploads', icon: FiMusic },
  { name: 'Account', to: '/account', icon: FiUser },
];

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav aria-label="Main navigation" className="mt-6 space-y-1">
    {links.map(({ name, to, icon: Icon }) => (
      <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate}
        className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />{name}
      </NavLink>
    ))}
  </nav>
);

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = drawer.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => { if (query.matches) setOpen(false); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <>
      <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-white/5 bg-[#151321] px-4 py-6 md:block">
        <NavLink to="/" aria-label="EchoWave home"><img src={logo} alt="EchoWave" className="h-12 w-full object-contain" /></NavLink>
        <NavLinks />
      </aside>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#151321] px-4 md:hidden">
        <NavLink to="/" aria-label="EchoWave home"><img src={logo} alt="EchoWave" className="h-9 w-32 object-contain object-left" /></NavLink>
        <button type="button" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation"
          onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10">
          <HiOutlineMenu size={24} />
        </button>
      </header>
      <dialog ref={drawer} id="mobile-navigation" aria-label="Navigation menu" onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)} onClick={event => { if (event.target === drawer.current) setOpen(false); }}
        className="mobile-navigation fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(320px,88vw)] max-w-none border-0 bg-[#151321] p-5 text-white backdrop:bg-black/65">
        <div onClick={event => event.stopPropagation()}>
          <div className="flex items-center justify-between">
            <img src={logo} alt="EchoWave" className="h-10 w-36 object-contain object-left" />
            <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><FiX size={24} /></button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </dialog>
    </>
  );
}
