import { useState, useEffect, useCallback, useRef } from 'react';
import { getClubInfoWithRateLimit } from '../api/config';

// Singleton state management for club data
let clubState = {
  club: null,
  loading: true,
  error: null,
  rateLimited: false,
  subscribers: new Set(),
  fetchPromise: null,
  lastFetch: 0
};

const CACHE_DURATION = 30000; // 30 seconds cache

// Notify all subscribers of state changes
const notifySubscribers = () => {
  clubState.subscribers.forEach(callback => callback(clubState));
};

// Single fetch function that all components share
const fetchClubData = async () => {
  const now = Date.now();
  
  // If we have a recent fetch or one is in progress, return the existing promise
  if (clubState.fetchPromise && (now - clubState.lastFetch) < CACHE_DURATION) {
    return clubState.fetchPromise;
  }

  // If we already have data and it's recent, don't fetch again
  if (clubState.club && (now - clubState.lastFetch) < CACHE_DURATION) {
    return Promise.resolve();
  }

  console.log('🏢 Fetching club data (singleton)...');
  
  clubState.loading = true;
  clubState.error = null;
  clubState.rateLimited = false;
  clubState.lastFetch = now;
  notifySubscribers();

  clubState.fetchPromise = (async () => {
    try {
      const result = await getClubInfoWithRateLimit();
      
      if (result.success) {
        clubState.club = result.data;
        clubState.error = null;
        clubState.rateLimited = false;
      } else {
        if (result.error.includes('Rate limited')) {
          clubState.rateLimited = true;
          clubState.error = `Rate limited. Please wait ${result.retryAfter} seconds before trying again.`;
        } else {
          clubState.error = result.error;
          clubState.club = null;
          clubState.rateLimited = false;
        }
      }
    } catch (err) {
      console.warn("User might not have a club yet:", err);
      clubState.error = "Failed to load club data";
      clubState.club = null;
      clubState.rateLimited = false;
    } finally {
      clubState.loading = false;
      clubState.fetchPromise = null;
      notifySubscribers();
    }
  })();

  return clubState.fetchPromise;
};

// Refresh function that ignores cache
const refreshClubData = async () => {
  if (clubState.rateLimited) {
    clubState.error = "Please wait before refreshing again.";
    notifySubscribers();
    return;
  }
  
  // Clear cache and fetch fresh data
  clubState.lastFetch = 0;
  clubState.fetchPromise = null;
  return fetchClubData();
};

// Hook that subscribes to the singleton state
const useClubSingleton = () => {
  const [localState, setLocalState] = useState({
    club: clubState.club,
    loading: clubState.loading,
    error: clubState.error,
    rateLimited: clubState.rateLimited
  });

  const subscriberRef = useRef(null);

  // Create subscriber callback
  const updateLocalState = useCallback((newState) => {
    setLocalState({
      club: newState.club,
      loading: newState.loading,
      error: newState.error,
      rateLimited: newState.rateLimited
    });
  }, []);

  useEffect(() => {
    // Subscribe to state changes
    subscriberRef.current = updateLocalState;
    clubState.subscribers.add(subscriberRef.current);

    // Initial fetch if we don't have data
    if (!clubState.club && !clubState.loading && !clubState.fetchPromise) {
      fetchClubData();
    }

    // Cleanup subscription
    return () => {
      if (subscriberRef.current) {
        clubState.subscribers.delete(subscriberRef.current);
      }
    };
  }, [updateLocalState]);

  // Return current state and actions
  return {
    club: localState.club,
    loading: localState.loading,
    error: localState.error,
    rateLimited: localState.rateLimited,
    refreshClub: refreshClubData,
    refetch: fetchClubData
  };
};

// Export function to clear cache (useful for logout)
export const clearClubCache = () => {
  clubState.club = null;
  clubState.loading = true;
  clubState.error = null;
  clubState.rateLimited = false;
  clubState.fetchPromise = null;
  clubState.lastFetch = 0;
  notifySubscribers();
};

export default useClubSingleton;
