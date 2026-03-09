import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { analyzeListingMedia } from '../services/geminiService';

interface CreateListingProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setMedia(reader.result as string);
      setLoading(true);
      
      try {
        const analysis = await analyzeListingMedia(base64, file.type);
        setFormData({
          title: analysis.title || '',
          description: analysis.description || '',
          price: analysis.suggestedPrice?.toString() || '',
          category: analysis.category || ''
        });
        setStep('review');
      } catch (err) {
        console.error(err);
        setStep('review'); // Still let them fill manually
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          media_url: media,
          media_type: 'image', // Simplified for now
          user_id: 'u1' // Mock user
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold">New Listing</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 'upload' ? (
          <div className="h-full flex flex-col items-center justify-center gap-8">
            <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
              <Camera className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Upload Media</h3>
              <p className="text-zinc-500 text-sm mb-8">AI will automatically generate details for you</p>
              
              <label className="bg-white text-black px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-zinc-200 transition-colors flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Select Photo/Video</span>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900">
              <img src={media!} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">AI Generated Details</span>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Price ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Listing'}
            </button>
          </div>
        )}
      </div>

      {loading && step === 'upload' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-[110]">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="font-bold">AI is analyzing your product...</p>
        </div>
      )}
    </div>
  );
};

export default CreateListing;
