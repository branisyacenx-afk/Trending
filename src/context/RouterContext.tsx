import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Page } from '@/types';

interface RouterContextType {
  page: Page;
  navigate: (page: Page) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  const validPages: Page[] = [
    'landing', 'login', 'signup', 'dashboard', 'setup',
    'support', 'admin', 'risk', 'performance',
  ];
  return (validPages.includes(hash as Page) ? hash : 'landing') as Page;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(getPageFromHash());

  const navigate = useCallback((newPage: Page) => {
    window.location.hash = `/${newPage}`;
    setPage(newPage);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handler = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <RouterContext.Provider value={{ page, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
