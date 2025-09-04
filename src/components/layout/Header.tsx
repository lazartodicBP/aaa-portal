'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { AccountService } from '@/services/api/account.service';
import { Account } from '@/services/api/types';
import { Search, UserPlus, Users } from 'lucide-react';
import { Logo } from "@/components/ui/Logo";


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const accounts = await AccountService.getAccountsByName(searchQuery);
        setSearchResults(accounts);
        setShowDropdown(accounts.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAccountSelect = (account: Account) => {
    // Navigate to manage membership page with the selected account
    router.push(`/manage-membership/${account.id}`);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="relative bg-[#004b87] border-b border-gray-200 shadow-sm">
      <div className="h-16">
        {/* Logo: absolute left */}
        <div className="absolute inset-y-0 left-10 flex items-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto text-white" />
            <span className="ml-3 text-white text-sm">
          Customer Service Portal
        </span>
          </Link>
        </div>

        {/* Search bar: centered */}
        <div className="absolute inset-y-0 left-0 right-0 flex justify-center items-center">
          <div className="w-full max-w-md" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />

              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                </div>
              )}

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  <ul className="py-1">
                    {searchResults.map((account) => (
                      <li
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Name: {account.name} • Status: {account.status}
                            </p>
                          </div>
                          <span className="text-xs text-blue-600">View →</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info and Actions: absolute right */}
        <div className="absolute inset-y-0 right-10 flex items-center 2xl:gap-96 xl:gap-20 md:gap-10">
          {pathname !== '/new-member' && pathname !== '/new-sale' && (
            <Link href="/new-sale">
              <Button
                variant="primary"
                className="text-[#004b87] hover:bg-gray-100 font-semibold hover:text-[#004b87]"
              >
                <UserPlus className="w-4 h-4" />
                <span className="ml-2">New Sale</span>
              </Button>
            </Link>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#FDB913] rounded-full flex items-center justify-center">
              <span className="text-[#004b87] font-semibold text-sm">DP</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">Debbie P.</p>
              <p className="text-xs text-gray-300">Sales Agent</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}