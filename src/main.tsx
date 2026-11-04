import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './hooks/useFirebase.tsx';

createRoot(document.getElementById('root')!).render(
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);
