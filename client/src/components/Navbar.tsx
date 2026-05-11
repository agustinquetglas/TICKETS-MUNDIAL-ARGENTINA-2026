'use client';

import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';
import UserMenu from './UserMenu';

export default function Navbar() {
  return (
    <nav className="global-navbar">
      <div className="navbar-content">
        <Link href="/" className="navbar-logo">
          <Image
            src="/Logo-Copa-Mundial.png"
            alt="Mundial 2026"
            width={40}
            height={40}
            priority
          />
          <span className="navbar-title">Argentina 2026</span>
        </Link>

        <div className="navbar-actions">
          <DarkModeToggle />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
