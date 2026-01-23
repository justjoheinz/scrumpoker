/**
 * useAdminStats hook - Fetches and manages admin statistics
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminStats } from '@/types/admin';

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: AdminStats = await response.json();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
