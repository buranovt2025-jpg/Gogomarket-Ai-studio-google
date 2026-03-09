import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface Message {
  id?: number;
  room_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
}

interface ChatRoomProps {
  roomId: string;
  userId: string;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, userId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socket = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket) {
      socket.emit('join_room', roomId);
      
      socket.on('receive_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Fetch history
      fetch(`/api/messages/${roomId}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const messageData = {
      room_id: roomId,
      sender_id: userId,
      content: input,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    
    // Save to DB via API
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 glass-dark">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-zinc-900 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
              <img src={`https://picsum.photos/seed/${roomId}/100/100`} alt="User" />
            </div>
            <div>
              <p className="font-bold text-sm">Support Team</p>
              <p className="text-[10px] text-emerald-500">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Phone className="w-5 h-5" />
          <Video className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender_id === userId 
                ? 'bg-emerald-500 text-black rounded-tr-none' 
                : 'bg-zinc-900 text-white rounded-tl-none'
            }`}>
              {msg.content}
              <p className={`text-[8px] mt-1 opacity-50 ${msg.sender_id === userId ? 'text-black' : 'text-zinc-400'}`}>
                12:45 PM
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 glass-dark">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-sm py-2"
          />
          <button 
            onClick={sendMessage}
            className="p-2 bg-emerald-500 text-black rounded-xl active:scale-90 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
