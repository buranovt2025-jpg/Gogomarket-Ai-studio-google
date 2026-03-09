import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, ShoppingBag, ChevronDown } from 'lucide-react';

interface Reel {
  id: string;
  user: {
    username: string;
    avatar_url: string;
  };
  video_url: string;
  title: string;
  price: number;
}

const ReelsFeed: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock data for reels
    const mockReels: Reel[] = [
      {
        id: 'r1',
        user: { username: 'alex_tech', avatar_url: 'https://picsum.photos/seed/alex/100/100' },
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-34505-large.mp4',
        title: 'Cyberpunk Jacket',
        price: 250
      },
      {
        id: 'r2',
        user: { username: 'maria_style', avatar_url: 'https://picsum.photos/seed/maria/100/100' },
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-modelling-a-red-dress-41443-large.mp4',
        title: 'Red Evening Dress',
        price: 450
      }
    ];
    setReels(mockReels);
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
      setCurrentIndex(index);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
    >
      {reels.map((reel, index) => (
        <div key={reel.id} className="h-screen w-full snap-start relative">
          <video 
            src={reel.video_url} 
            className="h-full w-full object-cover"
            autoPlay={index === currentIndex}
            loop
            muted
            playsInline
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
          
          {/* Right Actions */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-2">
                <img src={reel.user.avatar_url} alt={reel.user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
                <Heart className="w-6 h-6" />
              </button>
              <span className="text-xs font-bold">1.2k</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </button>
              <span className="text-xs font-bold">45</span>
            </div>

            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-24 left-4 right-20">
            <p className="font-bold text-lg mb-1">@{reel.user.username}</p>
            <p className="text-sm text-zinc-200 mb-4 line-clamp-2">{reel.title}</p>
            
            <button className="flex items-center gap-3 bg-emerald-500 text-black px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
              <ShoppingBag className="w-5 h-5" />
              <span>Buy for ${reel.price}</span>
            </button>
          </div>
        </div>
      ))}
      
      {reels.length === 0 && (
        <div className="h-full w-full flex items-center justify-center text-zinc-500">
          Loading Reels...
        </div>
      )}
    </div>
  );
};

export default ReelsFeed;
