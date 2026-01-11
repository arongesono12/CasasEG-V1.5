import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message, Notification } from '../types';
import { INITIAL_MESSAGES } from '../constants/mockData';
import * as supabaseService from '../services/supabaseService';

interface MessagingContextType {
  messages: Message[];
  notifications: Notification[];
  sendMessage: (message: Message) => void;
  addNotification: (notification: Notification) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
    if (!useSupabase) return;

    (async () => {
      try {
        const remote = await supabaseService.fetchMessages();
        if (Array.isArray(remote) && remote.length) setMessages(remote as Message[]);
      } catch (e) {
        console.warn('Supabase messages fetch failed', e);
      }
    })();
  }, []);

  const sendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  return (
    <MessagingContext.Provider value={{ 
      messages, 
      notifications, 
      sendMessage, 
      addNotification 
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging debe ser usado dentro de un MessagingProvider');
  }
  return context;
};

