'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Home,
  Users,
  CreditCard,
  RefreshCw,
  FileText,
  BarChart3,
  Settings,
  Phone,
  Car,
  Shield,
  Tag,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  UserMinus,
  DollarSign,
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: {
    name: string;
    href: string;
    icon?: React.ElementType;
  }[];
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Members']);

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      name: 'Members',
      icon: Users,
      subItems: [
        { name: 'New Sale', href: '/new-sale', icon: Plus },
        { name: 'Search Members', href: '/members/search', icon: Users },
        { name: 'Manage Membership', href: '/members/manage', icon: UserPlus },
        { name: 'Remove Associate', href: '/members/remove', icon: UserMinus },
        { name: 'Transfer Membership', href: '/members/transfer', icon: RefreshCw },
        { name: 'Reinstate', href: '/members/reinstate', icon: Shield },
      ],
    },
    {
      name: 'Billing',
      icon: CreditCard,
      subItems: [
        { name: 'Process Payment', href: '/billing/payment', icon: DollarSign },
        { name: 'Outstanding Balances', href: '/billing/balances', icon: AlertCircle },
        { name: 'Overpayments', href: '/billing/overpayments', icon: RefreshCw },
        { name: 'Billing Plans', href: '/billing/plans', icon: Calendar },
      ],
    },
    {
      name: 'Roadside',
      icon: Car,
      subItems: [
        { name: 'Service Request', href: '/roadside/request', icon: Phone },
        { name: 'Service History', href: '/roadside/history', icon: FileText },
      ],
    },
    {
      name: 'Promotions',
      icon: Tag,
      subItems: [
        { name: 'Active Campaigns', href: '/promotions/active', icon: Tag },
        { name: 'Create Campaign', href: '/promotions/create', icon: Plus },
        { name: 'Promo Codes', href: '/promotions/codes', icon: Tag },
      ],
    },
    {
      name: 'Business',
      icon: Briefcase,
      subItems: [
        { name: 'Business Accounts', href: '/business/accounts', icon: Briefcase },
        { name: 'Group Memberships', href: '/business/groups', icon: Users },
      ],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      badge: '3',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: MenuItem) => {
    if (item.href) return isActive(item.href);
    return item.subItems?.some(subItem => isActive(subItem.href)) || false;
  };

  return (
    <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.name);
            const isCurrentActive = isParentActive(item);

            return (
              <div key={item.name}>
                {item.href ? (
                  // Simple link item
                  <Link
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive(item.href)
                        ? 'bg-[#004B87] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#004B87]'
                    )}
                  >
                    <Icon
                      className={clsx(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-[#004B87]'
                      )}
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-[#FDB913] text-[#004B87] text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  // Expandable item
                  <>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={clsx(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full',
                        isCurrentActive
                          ? 'bg-gray-100 text-[#004B87]'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-[#004B87]'
                      )}
                    >
                      <Icon
                        className={clsx(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isCurrentActive
                            ? 'text-[#004B87]'
                            : 'text-gray-400 group-hover:text-[#004B87]'
                        )}
                      />
                      {item.name}
                      <span className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {/* Sub-items */}
                    {isExpanded && item.subItems && (
                      <div className="mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={clsx(
                                'group flex items-center pl-10 pr-2 py-2 text-sm rounded-md transition-colors',
                                isActive(subItem.href)
                                  ? 'bg-[#004B87] text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#004B87]'
                              )}
                            >
                              {SubIcon && (
                                <SubIcon
                                  className={clsx(
                                    'mr-3 h-4 w-4',
                                    isActive(subItem.href)
                                      ? 'text-white'
                                      : 'text-gray-400'
                                  )}
                                />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="mt-3 space-y-1">
            <Link
              href="/members/search"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#004B87]"
            >
              <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-[#004B87]" />
              Find Member
            </Link>
            <Link
              href="/roadside/request"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#004B87]"
            >
              <Car className="mr-3 h-5 w-5 text-gray-400 group-hover:text-[#004B87]" />
              Roadside Help
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-[#004B87]" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Need Help?</p>
              <p className="text-xs text-gray-500">Support: 1-800-AAA-HELP</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};