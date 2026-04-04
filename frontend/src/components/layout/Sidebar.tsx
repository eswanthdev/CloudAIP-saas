'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, title, onItemClick }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-20 right-4 md:hidden z-40 p-2 bg-primary-600 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative md:block z-30 w-64 bg-secondary-50 border-r border-secondary-200 h-screen
          transition-transform duration-300 transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-secondary-200">
          {title && <h3 className="text-lg font-bold text-secondary-900">{title}</h3>}
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
