/**
 * Cookie Service
 * Handles cookie tracking for analytics, preferences, and user identification
 */

interface CookieOptions {
  expires?: number; // Days until expiration
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with optional configuration
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const {
    expires = 365, // Default: 1 year
    path = '/',
    domain,
    secure = window.location.protocol === 'https:',
    sameSite = 'lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return null;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  setCookie(name, '', { expires: -1, path });
};

/**
 * Check if cookies are enabled
 */
export const areCookiesEnabled = (): boolean => {
  try {
    setCookie('casaseg_cookie_test', 'test', { expires: 1 });
    const enabled = getCookie('casaseg_cookie_test') === 'test';
    deleteCookie('casaseg_cookie_test');
    return enabled;
  } catch (e) {
    return false;
  }
};

/**
 * Track user session with cookies
 */
export const trackUserSession = (userId?: string): void => {
  if (!areCookiesEnabled()) {
    console.warn('Cookies are disabled. Session tracking may be limited.');
    return;
  }

  const sessionId = getCookie('casaseg_session_id') || generateSessionId();
  setCookie('casaseg_session_id', sessionId, { expires: 1 }); // 1 day

  if (userId) {
    setCookie('casaseg_user_id', userId, { expires: 365 }); // 1 year
  }

  // Track first visit
  if (!getCookie('casaseg_first_visit')) {
    setCookie('casaseg_first_visit', new Date().toISOString(), { expires: 365 });
  }

  // Track last visit
  setCookie('casaseg_last_visit', new Date().toISOString(), { expires: 365 });

  // Increment visit count
  const visitCount = parseInt(getCookie('casaseg_visit_count') || '0', 10) + 1;
  setCookie('casaseg_visit_count', visitCount.toString(), { expires: 365 });
};

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get user tracking data
 */
export const getUserTrackingData = () => {
  return {
    sessionId: getCookie('casaseg_session_id'),
    userId: getCookie('casaseg_user_id'),
    firstVisit: getCookie('casaseg_first_visit'),
    lastVisit: getCookie('casaseg_last_visit'),
    visitCount: parseInt(getCookie('casaseg_visit_count') || '0', 10),
  };
};

/**
 * Track user preferences
 */
export const setUserPreference = (key: string, value: string): void => {
  setCookie(`casaseg_pref_${key}`, value, { expires: 365 });
};

/**
 * Get user preference
 */
export const getUserPreference = (key: string): string | null => {
  return getCookie(`casaseg_pref_${key}`);
};

/**
 * Track page view
 */
export const trackPageView = (page: string): void => {
  const pageViews = JSON.parse(getCookie('casaseg_page_views') || '{}');
  pageViews[page] = (pageViews[page] || 0) + 1;
  setCookie('casaseg_page_views', JSON.stringify(pageViews), { expires: 30 });
};

/**
 * Get page view statistics
 */
export const getPageViewStats = (): Record<string, number> => {
  return JSON.parse(getCookie('casaseg_page_views') || '{}');
};

/**
 * Clear all tracking cookies (for privacy/GDPR compliance)
 */
export const clearTrackingCookies = (): void => {
  const cookies = [
    'casaseg_session_id',
    'casaseg_user_id',
    'casaseg_first_visit',
    'casaseg_last_visit',
    'casaseg_visit_count',
    'casaseg_page_views',
  ];

  cookies.forEach(cookie => deleteCookie(cookie));
  
  // Clear all preference cookies
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('casaseg_pref_')) {
      deleteCookie(cookieName);
    }
  });
};

