import { useEffect } from 'react';
import { AppRouter } from './navigation/AppRouter';
import { ConnectivityHandler } from './components/ConnectivityHandler';
import { trackVisit } from './services/visitService';
import { trackUserSession } from './services/cookieService';

export default function App() {
  useEffect(() => {
    trackVisit();
    trackUserSession();
  }, []);

  return (
    <ConnectivityHandler>
      <AppRouter />
    </ConnectivityHandler>
  );
}
