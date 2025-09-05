'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AccountService } from '@/services/api/account.service';
import { Account } from '@/services/api/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Users, ArrowRight, Shield, Car, Star } from 'lucide-react';

export default function ManageMembershipLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const accounts = await AccountService.getAccountsByName(searchQuery);
        setSearchResults(accounts);
        setHasSearched(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAccountClick = (account: Account) => {
    router.push(`/manage-membership/${account.id}`);
  };

  const getMembershipIcon = (level: string) => {
    switch(level?.toUpperCase()) {
      case 'CLASSIC': return <Car className="w-4 h-4" />;
      case 'PLUS': return <Shield className="w-4 h-4" />;
      case 'PREMIER': return <Star className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-aaa-blue mb-2">
          Manage Membership
        </h1>
        <p className="text-gray-600">
          Search for a member to view and manage their membership details
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member name (minimum 2 characters)..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-aaa-blue focus:border-aaa-blue text-base"
            autoFocus
          />

          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-aaa-blue"></div>
            </div>
          )}
        </div>

        {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
          <p className="mt-2 text-sm text-gray-500">
            Please enter at least 2 characters to search
          </p>
        )}
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card title={`Search Results ${searchResults.length > 0 ? `(${searchResults.length})` : ''}`}>
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-aaa-blue cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-aaa-blue">
                          {account.name}
                        </h3>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          account.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                        <span>Member ID: <span className="font-mono">{account.aaa_MemberID || account.id}</span></span>
                        {account.aaa_MemberCardNumber && (
                          <>
                            <span>•</span>
                            <span>Card: <span className="font-mono">{account.aaa_MemberCardNumber}</span></span>
                          </>
                        )}
                        {account.aaa_MemberAcctType && (
                          <>
                            <span>•</span>
                            <span>{account.aaa_MemberAcctType}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccountClick(account);
                      }}
                      className="flex items-center gap-2"
                    >
                      Manage
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No members found matching "{searchQuery}"
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try searching with a different name
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Initial State */}
      {!hasSearched && !isSearching && searchQuery.trim().length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Start typing to search for a member
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Enter at least 2 characters to begin searching
            </p>
          </div>
        </Card>
      )}

      {/* Quick Tips */}
      <Card title="Quick Tips">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="text-aaa-blue mr-2">•</span>
            <span>Search by member's first name, last name, or full name</span>
          </div>
          <div className="flex items-start">
            <span className="text-aaa-blue mr-2">•</span>
            <span>Click on any member to view and manage their membership details</span>
          </div>
          <div className="flex items-start">
            <span className="text-aaa-blue mr-2">•</span>
            <span>From the membership page, you can upgrade, downgrade, or add promo codes</span>
          </div>
        </div>
      </Card>
    </div>
  );
}