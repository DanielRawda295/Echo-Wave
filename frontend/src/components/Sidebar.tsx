// src/components/Sidebar.tsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHashtag, HiOutlineHome, HiOutlineMenu, HiOutlinePhotograph, HiOutlineUserGroup } from 'react-icons/hi';
import { FaRegHeart } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { FiList } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { FiUploadCloud } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiMusic } from 'react-icons/fi';
import { RiCloseLine } from 'react-icons/ri';
import { logo } from '../assets';

/**
 * Represents a single navigation link item.
 */
type LinkItem = {
  /** Display name of the link */
  name: string;

  /** Path to navigate to */
  to: string;

  /** Icon component for the link */
  icon: React.ElementType;
};

/** Array of navigation links for sidebar */
const links: LinkItem[] = [
  { name: 'Discover', to: '/', icon: HiOutlineHome },
  { name: 'Around You', to: '/around-you', icon: HiOutlinePhotograph },
  { name: 'Top Artists', to: '/top-artists', icon: HiOutlineUserGroup },
  { name: 'Top Charts', to: '/top-charts', icon: HiOutlineHashtag },
  { name: 'Recently Played', to: '/recently-played', icon: FiClock },
  { name: 'Community', to: '/community', icon: FiUsers },
  { name: 'Upload', to: '/upload', icon: FiUploadCloud },
  { name: 'My Uploads', to: '/my-uploads', icon: FiMusic },
  { name: 'Playlists', to: '/playlists', icon: FiList },
  { name: 'Favorites', to: '/favorites', icon: FaRegHeart },
  { name: 'Account', to: '/account', icon: FiUser },
];

/** Props for NavLinks component */
type NavLinksProps = {
  /** Optional callback when a link is clicked */
  handleClick?: () => void;
};

/**
 * NavLinks Component
 *
 * Renders the sidebar navigation links with icons.
 * Supports a click callback for mobile menu closure.
 */
const NavLinks: React.FC<NavLinksProps> = ({ handleClick }) => (
  <div className="mt-10">
    {links.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.name}
          to={item.to}
          className="flex flex-row justify-start items-center my-8 text-sm font-medium text-gray-400 hover:text-cyan-400"
          onClick={() => handleClick && handleClick()}
        >
          <Icon className="w-6 h-6 mr-2" />
          {item.name}
        </NavLink>
      );
    })}
  </div>
);

/**
 * Sidebar Component
 *
 * Provides a responsive sidebar navigation for desktop and mobile:
 * - Desktop: always visible
 * - Mobile: toggleable menu with smooth transition
 * - Includes logo and navigation links
 */
const Sidebar: React.FC = () => {
  /** State for controlling mobile menu visibility */
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <>
      {/** Desktop sidebar */}
      <div className="md:flex hidden flex-col w-[240px] py-10 px-4 bg-[#191624]">
        <img src={logo} alt="logo" className="w-full h-14 object-contain" />
        <NavLinks />
      </div>

      {/** Mobile menu toggle button */}
      <div className="absolute md:hidden block top-6 right-3">
        {!mobileMenuOpen ? (
          <HiOutlineMenu className="w-6 h-6 mr-2 text-white" onClick={() => setMobileMenuOpen(true)} />
        ) : (
          <RiCloseLine className="w-6 h-6 mr-2 text-white" onClick={() => setMobileMenuOpen(false)} />
        )}
      </div>

      {/** Mobile sidebar */}
      <div
        className={`absolute top-0 h-screen w-2/3 bg-linear-to-tl from-white/10 to-[#483D8B] backdrop-blur-lg z-10 p-6 md:hidden smooth-transition ${
          mobileMenuOpen ? 'left-0' : '-left-full'
        }`}
      >
        <img src={logo} alt="logo" className="w-full h-14 object-contain" />
        <NavLinks handleClick={() => setMobileMenuOpen(false)} />
      </div>
    </>
  );
};

export default Sidebar;
