'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuthContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-secondary-200 sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white">
              F
            </div>
            FinOps Academy
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-secondary-600 hover:text-primary-600 transition">
              Courses
            </Link>
            <Link href="/services" className="text-secondary-600 hover:text-primary-600 transition">
              Services
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-secondary-600 hover:text-primary-600 transition">
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-secondary-600 hover:text-primary-600 transition">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-secondary-600 text-sm">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-secondary-200 pt-4 space-y-2">
            <Link
              href="/courses"
              className="block px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded"
            >
              Courses
            </Link>
            <Link
              href="/services"
              className="block px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded"
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded"
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded"
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
