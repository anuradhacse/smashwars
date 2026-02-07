import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '@/app/api/client';

type SyncRange = 12 | 24 | 'all';

interface SyncContextValue {
  syncing: boolean;
  syncError: string | null;
  lastSyncMessage: string | null;
  triggerSync: (playerId: number, range: SyncRange) => Promise<void>;
  clearSyncMessage: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const triggerSync = useCallback(async (playerId: number, range: SyncRange) => {
    setSyncing(true);
    setSyncError(null);
    setLastSyncMessage(null);
    try {
      const monthsBack = range === 'all' ? 120 : range;
      const confirmExtendedRange = monthsBack > 12;
      const res = await api.syncPlayer(playerId, monthsBack, confirmExtendedRange);
      setLastSyncMessage(res.message);
    } catch {
      setSyncError('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  }, []);

  const clearSyncMessage = useCallback(() => {
    setSyncError(null);
    setLastSyncMessage(null);
  }, []);

  return (
    <SyncContext.Provider
      value={{ syncing, syncError, lastSyncMessage, triggerSync, clearSyncMessage }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
