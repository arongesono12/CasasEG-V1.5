import { User, Property, Message } from '../types';
import { UserActivity, OwnerActivity, PropertyMetrics, SystemMetrics } from '../types/analytics';

/**
 * Analytics Service
 * Calculates metrics and statistics for the admin dashboard
 */

/**
 * Get user activity data
 */
export const getUserActivities = (
  users: User[],
  properties: Property[],
  messages: Message[]
): UserActivity[] => {
  return users
    .filter(u => u.role === 'client')
    .map(user => {
      const userMessages = messages.filter(m => m.fromId === user.id);
      
      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        propertiesViewed: 0, // Would need view tracking
        messagesSent: userMessages.length,
        searchesPerformed: 0 // Would need search tracking
      };
    });
};

/**
 * Get owner activity data
 */
export const getOwnerActivities = (
  users: User[],
  properties: Property[],
  messages: Message[]
): OwnerActivity[] => {
  return users
    .filter(u => u.role === 'owner')
    .map(owner => {
      const ownerProperties = properties.filter(p => p.ownerId === owner.id);
      const activeProps = ownerProperties.filter(p => p.status === 'active');
      const suspendedProps = ownerProperties.filter(p => p.status === 'suspended');
      const ownerMessages = messages.filter(m => m.toId === owner.id);
      
      // Calculate average rating
      const ratedProperties = ownerProperties.filter(p => p.rating > 0);
      const avgRating = ratedProperties.length > 0
        ? ratedProperties.reduce((sum, p) => sum + p.rating, 0) / ratedProperties.length
        : 0;
      
      return {
        ownerId: owner.id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        propertiesPublished: ownerProperties.length,
        activeProperties: activeProps.length,
        suspendedProperties: suspendedProps.length,
        messagesReceived: ownerMessages.length,
        totalViews: 0, // Would need view tracking
        averageRating: avgRating,
        responseRate: 0 // Would need response tracking
      };
    });
};

/**
 * Get top properties by various metrics
 */
export const getTopProperties = (
  properties: Property[],
  limit: number = 10
): PropertyMetrics[] => {
  return properties
    .map(property => ({
      propertyId: property.id,
      title: property.title,
      location: property.location,
      views: 0, // Would need view tracking
      messages: 0, // Would need message tracking per property
      rating: property.rating,
      status: property.status
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Get system-wide metrics
 */
export const getSystemMetrics = (
  users: User[],
  properties: Property[],
  messages: Message[]
): SystemMetrics => {
  const owners = users.filter(u => u.role === 'owner');
  const clients = users.filter(u => u.role === 'client');
  const activeProps = properties.filter(p => p.status === 'active');
  const suspendedProps = properties.filter(p => p.status === 'suspended');
  
  return {
    totalUsers: users.length,
    activeUsers: users.length, // Would need last login tracking
    totalOwners: owners.length,
    totalClients: clients.length,
    totalProperties: properties.length,
    activeProperties: activeProps.length,
    suspendedProperties: suspendedProps.length,
    totalMessages: messages.length,
    averageResponseTime: 0 // Would need timestamp tracking
  };
};

/**
 * Get search trends by location
 */
export const getSearchTrends = (properties: Property[]): { location: string; count: number; avgPrice: number }[] => {
  const locationMap = new Map<string, { count: number; totalPrice: number }>();
  
  properties.forEach(property => {
    const location = property.city || property.location;
    const existing = locationMap.get(location) || { count: 0, totalPrice: 0 };
    locationMap.set(location, {
      count: existing.count + 1,
      totalPrice: existing.totalPrice + property.price
    });
  });
  
  return Array.from(locationMap.entries())
    .map(([location, data]) => ({
      location,
      count: data.count,
      avgPrice: Math.round(data.totalPrice / data.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
