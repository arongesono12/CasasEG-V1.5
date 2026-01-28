export type UserRole = 'client' | 'owner' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  city?: string;
  region?: string;
  imageUrls: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  isOccupied: boolean;
  features: string[];
  waitingList: string[]; // Array of User IDs waiting for this property
  status: 'active' | 'suspended';
  rating: number;
  reviewCount: number;
  category?: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  propertyId: string;
  content: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: number;
}

export interface ConversationKey {
  propertyId: string;
  partnerId: string;
}

export interface LocalImage {
  id: string;
  url: string;
  isUploading: boolean;
  progress: number;
}

export interface ConversationGroup {
  property: Property;
  partner: User;
  lastMessage: Message;
  propertyId: string;
  partnerId: string;
}
