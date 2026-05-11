'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';

export default function UserMenu() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    setUserEmail(email);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (): Promise<void> => {
    localStorage.removeItem('user_email');
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/login');
  };

  if (!userEmail) {
    return (
      <Link href="/login" className="btn-header-login">
        Ingresar
      </Link>
    );
  }

  // Obtener inicial del email para el avatar
  const inicial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="user-avatar-btn"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <span className="user-avatar-inicial">{inicial}</span>
        <svg
          className={`user-avatar-chevron ${open ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <title>Desplegar menú</title>
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="user-dropdown">
          <p className="user-dropdown-email">{userEmail}</p>
          <div className="user-dropdown-divider" />
          <Link
            href="/compras-realizadas"
            className="user-dropdown-item"
            onClick={() => {
              setOpen(false);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <title>Ir a Mis entradas</title>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Mis entradas
          </Link>
          <button
            type="button"
            className="user-dropdown-item user-dropdown-logout"
            onClick={() => {
              void handleLogout();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <title>Cerrar sesión</title>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
