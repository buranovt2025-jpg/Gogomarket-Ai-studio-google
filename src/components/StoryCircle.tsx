import React from 'react';

interface StoryCircleProps {
  user: {
    username: string;
    avatar_url: string;
  };
  isUnread?: boolean;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ user, isUnread = true }) => {
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
      <div className={`w-16 h-16 rounded-full p-[2px] ${isUnread ? 'bg-gradient-to-tr from-emerald-400 to-blue-500' : 'bg-zinc-800'}`}>
        <div className="w-full h-full rounded-full border-2 border-[#050505] overflow-hidden bg-zinc-800">
          <img 
            src={user.avatar_url} 
            alt={user.username} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      <span className="text-[10px] text-zinc-400 truncate w-16 text-center">{user.username}</span>
    </div>
  );
};

export default StoryCircle;
