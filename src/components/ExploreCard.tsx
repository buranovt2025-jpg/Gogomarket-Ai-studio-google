import React from 'react';
import { motion } from 'motion/react';

interface ExploreCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    media_url: string;
    media_type: string;
  };
  index: number;
  onClick: (id: string) => void;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ listing, index, onClick }) => {
  const isLarge = index % 3 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(listing.id)}
      className={`relative rounded-xl overflow-hidden bg-zinc-900 group cursor-pointer ${isLarge ? 'row-span-2' : ''}`}
    >
      <img 
        src={listing.media_url} 
        alt={listing.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-sm font-medium truncate text-white">{listing.title}</p>
        <p className="text-xs text-emerald-400 font-bold">${listing.price.toLocaleString()}</p>
      </div>
      {listing.media_type === 'video' && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1 rounded-md">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
};

export default ExploreCard;
