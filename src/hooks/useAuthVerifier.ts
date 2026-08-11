import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export type AuthState =
  | 'booting'
  | 'checking'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'hydrating'
  | 'ready'
  | 'error';

export interface AuthFlowSnapshot {
  state: AuthState;
  sessionId?: string;
  user: any;
  authenticatedAt?: number;
  lastTransitionAt: number;
  error?: string;
}

export function useAuthVerifier() {
  const [snapshot, setSnapshot] = useState<AuthFlowSnapshot>({
    state: 'booting',
    user: null,
    lastTransitionAt: Date.now()
  });

  const transition = (newState: AuthState, overrides: Partial<AuthFlowSnapshot> = {}) => {
    setSnapshot(prev => {
      // Prevent impossible transitions like authenticated -> unauthenticated unless it's an explicit logout
      if (prev.state === 'ready' && newState === 'unauthenticated' && !overrides.error) {
        console.warn('[AuthVerifier] Suspicious transition from ready to unauthenticated blocked.');
        return prev;
      }
      
      return {
        ...prev,
        ...overrides,
        state: newState,
        lastTransitionAt: Date.now()
      };
    });
  };

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      transition('checking');
      
      try {
        
        const headers: Record<string, string> = {};
        
        
        const res = await fetch('/api/session', {
          credentials: 'include',
          headers
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            if (!cancelled) {
              transition('hydrating', { user: data.user, sessionId: 'server-session' });
              // Simulate hydration
              setTimeout(() => {
                if (!cancelled) transition('ready');
              }, 600);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[AuthVerifier] Server session check failed:', err);
      }

      // Fallback to Firebase
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (cancelled) return;
        
        if (currentUser) {
          transition('hydrating', { user: currentUser });
          setTimeout(() => {
            if (!cancelled) transition('ready');
          }, 600);
        } else {
          transition('unauthenticated', { user: null });
        }
      }, (error) => {
        console.error('[AuthVerifier] Firebase auth error:', error);
        if (!cancelled) transition('error', { error: error.message, user: null });
      });

      return () => {
        cancelled = true;
        unsubscribe();
      };
    };

    verify();
  }, []);

  return { snapshot, transition };
}
