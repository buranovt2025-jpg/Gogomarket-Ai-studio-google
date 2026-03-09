import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, MessageCircle, ShoppingBag, ShieldCheck, Share2, Heart } from 'lucide-react';

interface ProductDetailsProps {
  listingId: string;
  onClose: () => void;
  onChat: (userId: string) => void;
}

interface DetailedListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  media_url: string;
  media_type: string;
  username: string;
  avatar_url: string;
  is_verified: number;
  user_id: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ listingId, onClose, onChat }) => {
  const [listing, setListing] = useState<DetailedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const [listingRes, likesRes] = await Promise.all([
          fetch(`/api/listings/${listingId}`),
          fetch(`/api/listings/${listingId}/likes`)
        ]);
        const listingData = await listingRes.json();
        const likesData = await likesRes.json();
        setListing(listingData);
        setLikesCount(likesData.count);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'u1' }) // Mock current user
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    if (!listing) return;
    try {
      const res = await fetch(`/api/users/${listing.user_id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower_id: 'u1' }) // Mock current user
      });
      const data = await res.json();
      setFollowing(data.following);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#050505] z-[120] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-[#050505] z-[120] overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen bg-[#050505] pb-24">
        {/* Header Actions */}
        <div className="fixed top-0 left-0 right-0 max-w-md mx-auto p-4 flex justify-between items-center z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLike}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${liked ? 'bg-red-500 text-white' : 'bg-black/50 text-white'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Media Section */}
        <div className="aspect-[3/4] w-full relative">
          <img 
            src={listing.media_url} 
            alt={listing.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
              <p className="text-emerald-400 text-2xl font-bold">${listing.price.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900 px-3 py-1 rounded-full text-xs text-zinc-400 border border-white/5">
              {listing.category}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src={listing.avatar_url} alt={listing.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-bold">{listing.username}</p>
                {listing.is_verified === 1 && <ShieldCheck className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-xs text-zinc-500">Active 2h ago</p>
            </div>
            <button 
              onClick={handleFollow}
              className={`px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all ${following ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">Description</h3>
            <p className="text-zinc-400 leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Condition</p>
              <p className="font-medium">Like New</p>
            </div>
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Delivery</p>
              <p className="font-medium">Ships in 2 days</p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 glass-dark border-t border-white/5 flex gap-4 z-20">
          <button 
            onClick={() => onChat(listing.user_id)}
            className="flex-1 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </button>
          <button className="flex-[2] h-14 rounded-2xl bg-emerald-500 text-black flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform shadow-lg shadow-emerald-500/20">
            <ShoppingBag className="w-5 h-5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
