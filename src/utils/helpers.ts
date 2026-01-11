/**
 * Funciones utilitarias y helpers
 */

export const formatCurrency = (amount: number, currency: string = 'FCA'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('es-ES');
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const generateAvatarUrl = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

export const getRandomImageUrl = (width: number = 800, height: number = 600): string => {
  return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const scrollToTop = (smooth: boolean = true): void => {
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
};

