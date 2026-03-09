/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, Search, PlusSquare, Play, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StoryCircle from './components/StoryCircle';
import ExploreCard from './components/ExploreCard';
import ReelsFeed from './components/ReelsFeed';
import CreateListing from './components/CreateListing';
import ChatRoom from './components/ChatRoom';
import ProductDetails from './components/ProductDetails';

interface Listing {
  id: string;
  title: string;
  price: number;
  media_url: string;
  media_type: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_verified: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsRes, usersRes, notifsRes] = await Promise.all([
        fetch('/api/listings'),
        fetch('/api/users'),
        fetch('/api/notifications/u1') // Mock current user
      ]);
      const listingsData = await listingsRes.json();
      const usersData = await usersRes.json();
      const notifsData = await notifsRes.json();
      setListings(listingsData);
      setUsers(usersData);
      setNotifications(notifsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="pt-4 px-4">
            <div className="flex items-center justify-between mb-6">
              <button onClick={fetchData} className="text-2xl font-bold tracking-tighter active:scale-95 transition-transform">
                Gogomarket
              </button>
              <div className="flex gap-4">
                <button onClick={() => setActiveChat('global_room')} className="relative">
                  <MessageCircle className="w-6 h-6 text-zinc-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050505]" />
                </button>
              </div>
            </div>
            
            {/* Search and Categories */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Electronics', 'Fashion', 'Home', 'Gaming'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-white text-black' 
                        : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="px-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Price: ${maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Stories Section */}
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {users.map((user) => (
                <StoryCircle key={user.id} user={user} />
              ))}
            </div>

            {/* Masonry Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-zinc-900 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-24">
                {listings
                  .filter(l => {
                    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = selectedCategory === 'All' || (l as any).category === selectedCategory;
                    const matchesPrice = l.price <= maxPrice;
                    return matchesSearch && matchesCategory && matchesPrice;
                  })
                  .map((listing, index) => (
                    <ExploreCard 
                      key={listing.id} 
                      listing={listing} 
                      index={index} 
                      onClick={(id) => setSelectedListing(id)}
                    />
                  ))}
                {listings.filter(l => {
                  const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = selectedCategory === 'All' || (l as any).category === selectedCategory;
                  const matchesPrice = l.price <= maxPrice;
                  return matchesSearch && matchesCategory && matchesPrice;
                }).length === 0 && (
                  <div className="col-span-2 py-20 text-center">
                    <p className="text-zinc-500 text-sm">No items found matching your criteria</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMaxPrice(2000); }}
                      className="mt-4 text-emerald-500 text-xs font-bold uppercase tracking-widest"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'search':
        return (
          <div className="pt-4 px-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search with AI... (e.g. 'gaming setup')"
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:border-emerald-500 outline-none transition-colors"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    setLoading(true);
                    try {
                      const res = await fetch('/api/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                      });
                      const data = await res.json();
                      setListings(data);
                      setActiveTab('explore'); // Show results in explore grid
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trending Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Electronics', 'Fashion', 'Home', 'Collectibles', 'Gaming'].map(cat => (
                  <button key={cat} className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-sm hover:border-emerald-500 transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'reels':
        return <ReelsFeed />;
      case 'profile':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">My Profile</h2>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-blue-500">
                <div className="w-full h-full rounded-full border-4 border-[#050505] overflow-hidden">
                  <img src="https://picsum.photos/seed/me/200/200" alt="Me" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-xl">Alex Doe</p>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-3">@alex_doe</p>
                <div className="flex gap-4 text-sm mb-8">
                  <div><span className="font-bold text-white">124</span> <span className="text-zinc-500">Followers</span></div>
                  <div><span className="font-bold text-white">82</span> <span className="text-zinc-500">Following</span></div>
                </div>

                <div className="space-y-6 mb-12">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Activity</h3>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-600 text-sm italic">No new notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="flex items-center gap-3">
                          <img src={notif.avatar_url} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          <p className="text-sm">
                            <span className="font-bold">{notif.username}</span> 
                            {notif.type === 'like' ? ' liked your listing' : ' started following you'}
                          </p>
                          <span className="text-[10px] text-zinc-600 ml-auto">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-4">My Listings</h3>
            <div className="grid grid-cols-3 gap-1 px-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-zinc-900 overflow-hidden">
                  <img src={`https://picsum.photos/seed/myitem${i}/300/300`} alt="My Item" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="h-screen flex items-center justify-center text-zinc-500">
            Section Under Construction
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="max-w-md mx-auto relative min-h-screen border-x border-white/5">
        {renderContent()}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-dark border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
          <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'explore' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Home className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'search' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Search className="w-6 h-6" />
          </button>
          <button onClick={() => setShowCreate(true)} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg shadow-white/20 active:scale-95 transition-transform">
              <PlusSquare className="w-7 h-7" />
            </div>
          </button>
          <button onClick={() => setActiveTab('reels')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'reels' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Play className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <User className="w-6 h-6" />
          </button>
        </nav>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100]"
            >
              <CreateListing 
                onClose={() => setShowCreate(false)} 
                onSuccess={() => {
                  setShowCreate(false);
                  fetchData();
                }} 
              />
            </motion.div>
          )}

          {activeChat && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[110]"
            >
              <ChatRoom 
                roomId={activeChat === 'global_room' ? 'global_room' : `chat_${activeChat}`} 
                userId="u1" 
                onBack={() => setActiveChat(null)} 
              />
            </motion.div>
          )}

          {selectedListing && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[120]"
            >
              <ProductDetails 
                listingId={selectedListing} 
                onClose={() => setSelectedListing(null)} 
                onChat={(userId) => {
                  setSelectedListing(null);
                  setActiveChat(userId);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
