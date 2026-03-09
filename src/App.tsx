/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Search, PlusSquare, Play, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="pt-4 px-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Gogomarket</h1>
              <div className="flex gap-4">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
            
            {/* Stories Placeholder */}
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-blue-500">
                    <div className="w-full h-full rounded-full border-2 border-[#050505] overflow-hidden bg-zinc-800">
                      <img 
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        alt="User" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400">User {i}</span>
                </div>
              ))}
            </div>

            {/* Masonry Grid Placeholder */}
            <div className="grid grid-cols-2 gap-2 pb-24">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className={`relative rounded-xl overflow-hidden bg-zinc-900 ${i % 3 === 0 ? 'row-span-2' : ''}`}
                >
                  <img 
                    src={`https://picsum.photos/seed/item${i}/400/${i % 3 === 0 ? '600' : '400'}`} 
                    alt="Item" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm font-medium truncate">Item Name {i}</p>
                    <p className="text-xs text-emerald-400 font-bold">${(Math.random() * 1000).toFixed(0)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'reels':
        return (
          <div className="h-screen bg-black flex items-center justify-center">
            <p className="text-zinc-500">Reels Feed Coming Soon</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">My Profile</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden">
                <img src="https://picsum.photos/seed/me/200/200" alt="Me" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold text-lg">Alex Doe</p>
                <p className="text-sm text-zinc-400">@alex_doe</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="max-w-md mx-auto relative min-h-screen">
        {renderContent()}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-dark border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
          <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 ${activeTab === 'explore' ? 'text-white' : 'text-zinc-500'}`}>
            <Home className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-white' : 'text-zinc-500'}`}>
            <Search className="w-6 h-6" />
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-lg shadow-white/10">
              <PlusSquare className="w-6 h-6" />
            </div>
          </button>
          <button onClick={() => setActiveTab('reels')} className={`flex flex-col items-center gap-1 ${activeTab === 'reels' ? 'text-white' : 'text-zinc-500'}`}>
            <Play className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-white' : 'text-zinc-500'}`}>
            <User className="w-6 h-6" />
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;
