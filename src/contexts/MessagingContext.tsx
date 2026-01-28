import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message, Notification } from '../types';
import * as supabaseService from '../services/supabaseService';

interface MessagingContextType {
  messages: Message[];
  notifications: any[];
  sendMessage: (message: Message) => Promise<void>;
  addNotification: (notification: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  refreshNotifications: (userId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchAll = async () => {
    try {
      const remoteMsgs = await supabaseService.fetchMessages();
      if (Array.isArray(remoteMsgs)) setMessages(remoteMsgs);
    } catch (e) {
      console.warn('Supabase messages fetch failed', e);
    }
  };

  const refreshNotifications = async (userId: string) => {
    try {
      const remoteNotifs = await supabaseService.fetchNotifications(userId);
      if (Array.isArray(remoteNotifs)) setNotifications(remoteNotifs);
    } catch (e) {
      console.warn('Supabase notifications fetch failed', e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const sendMessage = async (message: Message) => {
    // Optimistic update
    setMessages(prev => [...prev, message]);

    const useSupabase = import.meta.env.VITE_USE_SUPABASE !== 'false';
    if (useSupabase) {
      try {
        await supabaseService.createMessage(message);
      } catch (e) {
        console.error('Failed to persist message to Supabase', e);
      }
    }
  };

  const addNotification = async (notification: any) => {
    await supabaseService.createNotification(notification);
    if (notification.user_id) refreshNotifications(notification.user_id);
  };

  const markAsRead = async (id: string) => {
    await supabaseService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <MessagingContext.Provider value={{ 
      messages, 
      notifications, 
      sendMessage, 
      addNotification,
      markAsRead,
      refreshNotifications
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

