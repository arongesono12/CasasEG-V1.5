import { useEffect } from 'react';
import { AppRouter } from './navigation/AppRouter';
import { ConnectivityHandler } from './components/ConnectivityHandler';
import { trackVisit } from './services/visitService';

export default function App() {
  useEffect(() => {
    trackVisit();
  }, []);

  return (
    <ConnectivityHandler>
      <AppRouter />
    </ConnectivityHandler>
  );
}
