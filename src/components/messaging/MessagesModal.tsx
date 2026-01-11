import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Property, ConversationKey, ConversationGroup } from '../../types';
import { Icons } from '../Icons';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  messages: Message[];
  properties: Property[];
  onSendMessage: (propertyId: string, toId: string, content: string) => void;
  initialContext?: ConversationKey | null;
  users: User[]; // Add users prop
}

export const MessagesModal: React.FC<MessagesModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  messages, 
  properties, 
  onSendMessage, 
  initialContext,
  users 
}) => {
  const [selectedChat, setSelectedChat] = useState<ConversationKey | null>(initialContext || null);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContext) {
      setSelectedChat(initialContext);
    }
  }, [initialContext]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  if (!isOpen) return null;

  const conversations = messages.reduce((acc, msg) => {
    const isMe = msg.fromId === currentUser.id;
    const partnerId = isMe ? msg.toId : msg.fromId;
    const key = `${msg.propertyId}-${partnerId}`;

    if (!acc[key]) {
      const property = properties.find(p => p.id === msg.propertyId);
      const partner = users.find(u => u.id === partnerId);
      if (property && partner) {
        acc[key] = {
          property,
          partner,
          lastMessage: msg,
          propertyId: msg.propertyId,
          partnerId: partnerId
        };
      }
    } else {
      if (msg.timestamp > acc[key].lastMessage.timestamp) {
        acc[key].lastMessage = msg;
      }
    }
    return acc;
  }, {} as Record<string, ConversationGroup>);

  // If initialContext doesn't exist in conversations (new chat), add placeholder
  if (initialContext) {
    const key = `${initialContext.propertyId}-${initialContext.partnerId}`;
    if (!conversations[key]) {
      const property = properties.find(p => p.id === initialContext.propertyId);
      const partner = users.find(u => u.id === initialContext.partnerId);
      if (property && partner) {
        conversations[key] = {
          property,
          partner,
          lastMessage: { id: `init-${Date.now()}`, fromId: partner.id, toId: currentUser.id, propertyId: property.id, content: 'Nueva conversación', timestamp: Date.now() } as Message,
          propertyId: initialContext.propertyId,
          partnerId: initialContext.partnerId
        };
      }
    }
  }

  const conversationList = (Object.values(conversations) as ConversationGroup[]).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const currentMessages = selectedChat 
    ? messages.filter(m => 
        m.propertyId === selectedChat.propertyId && 
        ((m.fromId === currentUser.id && m.toId === selectedChat.partnerId) || 
         (m.fromId === selectedChat.partnerId && m.toId === currentUser.id))
      ).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const handleSend = () => {
    if (!selectedChat || !newMessage.trim()) return;
    onSendMessage(selectedChat.propertyId, selectedChat.partnerId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white w-full h-full md:h-[80vh] md:max-w-4xl md:rounded-3xl shadow-2xl flex overflow-hidden relative">
        <button onClick={onClose} aria-label="Cerrar mensajes" title="Cerrar mensajes" className="hidden md:block absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full">
          <Icons.Close className="w-5 h-5 text-gray-500" />
        </button>

        {/* Sidebar / List */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center md:h-20">
            <h2 className="text-xl font-bold">Mensajes</h2>
            <button onClick={onClose} aria-label="Cerrar mensajes" title="Cerrar mensajes" className="md:hidden p-2"><Icons.Close className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Icons.Message className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tienes mensajes</p>
              </div>
            ) : (
              conversationList.map((conv) => (
                <button
                  key={`${conv.propertyId}-${conv.partnerId}`}
                  onClick={() => setSelectedChat({ propertyId: conv.propertyId, partnerId: conv.partnerId })}
                  aria-label={`Abrir conversación con ${conv.partner.name}`}
                  title={`Abrir conversación con ${conv.partner.name}`}
                  className={`w-full text-left p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${
                    selectedChat?.propertyId === conv.propertyId && selectedChat?.partnerId === conv.partnerId ? 'bg-white border-l-4 border-l-black' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                     <span className="font-bold text-gray-900 text-sm truncate">{conv.partner.name}</span>
                     <span className="text-[10px] text-gray-400">{new Date(conv.lastMessage.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">{conv.property.title}</div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white h-16 md:h-20 shadow-sm z-10">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 -ml-2">
                  <Icons.ChevronLeft className="w-6 h-6" />
                </button>
                <img 
                  src={users.find(u => u.id === selectedChat.partnerId)?.avatar} 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200" 
                  alt="Partner"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {users.find(u => u.id === selectedChat.partnerId)?.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {properties.find(p => p.id === selectedChat.propertyId)?.title}
                  </p>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={chatContainerRef}>
                {currentMessages.length === 0 && (
                   <div className="text-center py-10 text-gray-400 text-sm">
                      Comienza la conversación...
                   </div>
                )}
                {currentMessages.map((msg) => {
                  const isMe = msg.fromId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMe ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 focus:ring-2 focus:ring-black outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-black text-white p-3 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    <Icons.Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
               <Icons.Message className="w-16 h-16 mb-4" />
               <p className="text-lg font-medium text-gray-400">Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

