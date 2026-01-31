import React from 'react';
import { Icon } from '@iconify/react';
import { 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';

// Wrapper component for lineicons to maintain compatibility with lucide-react API
const LineIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className }) => {
  return <Icon icon={`lineicons:${icon}`} className={className} width="1em" height="1em" />;
};

export const Icons = {
  Home: (props: { className?: string }) => <LineIcon icon="home" {...props} />,
  Search: (props: { className?: string }) => <LineIcon icon="search" {...props} />,
  User: (props: { className?: string }) => <LineIcon icon="user" {...props} />,
  Plus: (props: { className?: string }) => <LineIcon icon="plus" {...props} />,
  Logout: (props: { className?: string }) => <LineIcon icon="exit" {...props} />,
  Location: (props: { className?: string }) => <LineIcon icon="map-marker" {...props} />,
  Bed: (props: { className?: string }) => <LineIcon icon="bed" {...props} />,
  BedHeart: (props: { className?: string }) => <LineIcon icon="bed-heart" {...props} />,
  Bath: (props: { className?: string }) => <LineIcon icon="bath" {...props} />,
  Bell: (props: { className?: string }) => <LineIcon icon="bell" {...props} />,
  Admin: (props: { className?: string }) => <LineIcon icon="shield" {...props} />,
  Message: (props: { className?: string }) => <LineIcon icon="comment" {...props} />,
  Check: (props: { className?: string }) => <LineIcon icon="checkmark-circle" {...props} />,
  Close: (props: { className?: string }) => <LineIcon icon="close" {...props} />,
  AI: (props: { className?: string }) => <LineIcon icon="star" {...props} />,
  Sparkles: (props: { className?: string }) => <LineIcon icon="star" {...props} />,
  Menu: (props: { className?: string }) => <LineIcon icon="menu" {...props} />,
  Filter: (props: { className?: string }) => <LineIcon icon="filter" {...props} />,
  Delete: (props: { className?: string }) => <LineIcon icon="trash" {...props} />,
  ChevronLeft: (props: { className?: string }) => <LineIcon icon="arrow-left" {...props} />,
  ChevronRight: (props: { className?: string }) => <LineIcon icon="arrow-right" {...props} />,
  ChevronUp: (props: { className?: string }) => <LineIcon icon="arrow-up" {...props} />,
  ChevronDown: (props: { className?: string }) => <LineIcon icon="arrow-down" {...props} />,
  Image: (props: { className?: string }) => <LineIcon icon="image" {...props} />,
  Heart: (props: { className?: string }) => <LineIcon icon="heart" {...props} />,
  Star: (props: { className?: string }) => <LineIcon icon="star" {...props} />,
  Area: (props: { className?: string }) => <LineIcon icon="ruler" {...props} />,
  Send: (props: { className?: string }) => <LineIcon icon="paper-plane" {...props} />,
  Dashboard: (props: { className?: string }) => <LineIcon icon="dashboard" {...props} />,
  Users: (props: { className?: string }) => <LineIcon icon="users" {...props} />,
  Building: (props: { className?: string }) => <LineIcon icon="apartment" {...props} />,
  Settings: (props: { className?: string }) => <LineIcon icon="cog" {...props} />,
  Activity: (props: { className?: string }) => <LineIcon icon="pulse" {...props} />,
  History: (props: { className?: string }) => <LineIcon icon="history" {...props} />,
  TrendingUp: (props: { className?: string }) => <LineIcon icon="arrow-up-circle" {...props} />,
  Map: (props: { className?: string }) => <LineIcon icon="map" {...props} />,
  Grid: (props: { className?: string }) => <LineIcon icon="grid" {...props} />,
  Eye: (props: { className?: string }) => <LineIcon icon="eye" {...props} />,
  EyeOff: (props: { className?: string }) => <LineIcon icon="eye-off" {...props} />,
  WifiOff: (props: { className?: string }) => <LineIcon icon="wifi-off" {...props} />,
  Alert: (props: { className?: string }) => <LineIcon icon="warning" {...props} />,
  Clock: (props: { className?: string }) => <LineIcon icon="clock" {...props} />,
  Refresh: (props: { className?: string }) => <LineIcon icon="reload" {...props} />,
  Lock: (props: { className?: string }) => <LineIcon icon="lock" {...props} />,
  // Social Media Icons (keeping react-icons for now as they work well)
  Instagram: FaInstagram,
  Twitter: FaTwitter,
  X: FaTwitter, // Alias for X (formerly Twitter)
  LinkedIn: FaLinkedin,
  Youtube: FaYoutube
};
