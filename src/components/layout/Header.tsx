'use client';

import React, { useState } from 'react';
import {
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  Search,
  Settings, UserPlus
} from 'lucide-react';
import Link from "next/link";

export const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = {
    name: 'Debbie P.',
    role: 'Sales Agent',
    initials: 'DP',
  };

  const notifications = [
    { id: 1, message: 'New promo code SPRING2025 activated', time: '5m ago', unread: true },
    { id: 2, message: 'System maintenance scheduled for tonight', time: '1h ago', unread: true },
    { id: 3, message: 'Q1 sales report is now available', time: '3h ago', unread: false },
  ];

  return (
    <header className="bg-aaa-blue text-white shadow-lg relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-aaa-blue font-bold text-xl">AAA</span>
              </div>
              <span className="ml-3 text-lg font-semibold">
                Customer Service Portal
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-aaa-darkblue text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:ring-2 focus:ring-white sm:text-sm transition-colors"
                placeholder="Search members, accounts, or transactions..."
              />
            </div>
          </div>
          <Link
            href="/new-sale"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-100 hover:text-[#004B87]"
          >
            <UserPlus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-[#004B87]" />
            New Member
          </Link>
          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Help */}
            <button
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-aaa-darkblue transition-colors"
              title="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-aaa-darkblue transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-aaa-yellow" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-aaa-blue hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:text-white hover:bg-aaa-darkblue transition-colors"
              >
                <div className="w-8 h-8 bg-aaa-yellow rounded-full flex items-center justify-center">
                  <span className="text-aaa-blue font-semibold text-sm">
                    {currentUser.initials}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-gray-300">{currentUser.role}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>

                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    My Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </a>
                  <hr className="my-1" />
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};