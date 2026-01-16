export interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  lastLogin?: Date;
  propertiesViewed: number;
  messagesSent: number;
  searchesPerformed: number;
  joinedDate?: Date;
}

export interface OwnerActivity {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  propertiesPublished: number;
  activeProperties: number;
  suspendedProperties: number;
  messagesReceived: number;
  totalViews: number;
  averageRating: number;
  responseRate: number;
}

export interface PropertyMetrics {
  propertyId: string;
  title: string;
  location: string;
  views: number;
  messages: number;
  rating: number;
  status: 'active' | 'suspended';
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number; // Last 7 days
  totalOwners: number;
  totalClients: number;
  totalProperties: number;
  activeProperties: number;
  suspendedProperties: number;
  totalMessages: number;
  averageResponseTime: number;
}

export interface SearchTrend {
  location: string;
  searchCount: number;
  averagePrice: number;
}
