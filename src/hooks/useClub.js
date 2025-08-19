import { useState, useEffect, useCallback } from 'react';
import { getClubInfoWithRateLimit } from '../api/config';

const useClub = () => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  const fetchClub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRateLimited(false);

      const result = await getClubInfoWithRateLimit();
      
      if (result.success) {
        setClub(result.data);
      } else {
        if (result.error.includes('Rate limited')) {
          setRateLimited(true);
          setError(`Rate limited. Please wait ${result.retryAfter} seconds before trying again.`);
        } else {
          setError(result.error);
          setClub(null);
        }
      }
    } catch (err) {
      console.warn("User might not have a club yet:", err);
      setError("Failed to load club data");
      setClub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshClub = useCallback(async () => {
    if (rateLimited) {
      setError("Please wait before refreshing again.");
      return;
    }
    await fetchClub();
  }, [fetchClub, rateLimited]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  return {
    club,
    loading,
    error,
    rateLimited,
    refreshClub,
    refetch: fetchClub
  };
};

export default useClub;
