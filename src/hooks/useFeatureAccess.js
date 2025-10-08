import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import env from '../config/environment';
// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '${env.API_BASE_URL}/'
  : 'http://localhost:8000/api/';

export const useFeatureAccess = (featureCode) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [featureInfo, setFeatureInfo] = useState(null);

  const selectedClubId = localStorage.getItem('selectedClubId');

  const checkFeatureAccess = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (selectedClubId && selectedClubId !== 'null' && featureCode) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}users/feature-access/?club_id=${selectedClubId}&t=${Date.now()}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const { feature_access, subscription_tier, subscription_active } = response.data;
          
          // If no subscription tier is set, user needs to choose a plan
          if (!subscription_tier) {
            setHasAccess(false);
            setSubscriptionInfo({ tier: null, active: false });
          } else {
            setHasAccess(feature_access[featureCode] || false);
            setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
          }
          
          // Get feature info
          await getFeatureInfo();
        } catch (error) {
          if (error.response?.status === 403) {
            // User doesn't have access to this club, clear the selectedClubId and try to get the correct one
            console.warn('User does not have access to selected club, clearing localStorage and fetching correct club');
            localStorage.removeItem('selectedClubId');
            
            // Try to get the user's actual club
            try {
              const clubResponse = await axios.get(
                `${API_BASE_URL}users/my-club/`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              
              if (clubResponse.data && clubResponse.data.id) {
                const correctClubId = clubResponse.data.id.toString();
                localStorage.setItem('selectedClubId', correctClubId);
                
                // Retry with the correct club ID
                const retryResponse = await axios.get(
                  `${API_BASE_URL}users/feature-access/?club_id=${correctClubId}&t=${Date.now()}`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
                
                const { feature_access, subscription_tier, subscription_active } = retryResponse.data;
                
                // If no subscription tier is set, user needs to choose a plan
                if (!subscription_tier) {
                  setHasAccess(false);
                  setSubscriptionInfo({ tier: null, active: false });
                } else {
                  setHasAccess(feature_access[featureCode] || false);
                  setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
                }
                
                await getFeatureInfo();
                return;
              }
            } catch (clubError) {
              console.warn('Could not fetch user club:', clubError);
            }
          }
          
          // If we get here, something went wrong
          console.error('Error checking feature access:', error);
          setHasAccess(false);
          setSubscriptionInfo({ tier: null, active: false });
        }
      } else {
        setHasAccess(false);
        setSubscriptionInfo({ tier: null, active: false });
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
      setSubscriptionInfo({ tier: null, active: false });
    } finally {
      setLoading(false);
    }
  }, [selectedClubId, featureCode]);

  const getFeatureInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE_URL}users/features/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const feature = response.data.find(f => f.code === featureCode);
      if (feature) {
        setFeatureInfo(feature);
      }
    } catch (error) {
      console.error('Error fetching feature info:', error);
    }
  }, [featureCode]);

  const getSubscriptionTierInfo = useCallback((tier) => {
    const tiers = {
      basic: {
        name: 'Basic Gen',
        price: '£9.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts'
        ]
      },
      semipro: {
        name: 'SemiPro Gen',
        price: '£14.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          'Goal Posts'
        ]
      },
      prem: {
        name: 'Prem Gen',
        price: '£24.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          'Goal Posts',
          'Player of the Match Posts',
          'Bespoke Templates',
          'Multiple Teams'
        ]
      },
      null: {
        name: 'No Plan Selected',
        price: 'Choose a Plan',
        period: '',
        features: [
          'Please select a subscription plan to access features'
        ]
      }
    };
    return tiers[tier] || tiers.null;
  }, []);

  const getNextTier = useCallback((currentTier) => {
    const tierOrder = ['basic', 'semipro', 'prem'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  }, []);

  const refreshAccess = useCallback(() => {
    checkFeatureAccess();
  }, [checkFeatureAccess]);

  useEffect(() => {
    if (selectedClubId && featureCode) {
      checkFeatureAccess();
    } else {
      setLoading(false);
    }
  }, [selectedClubId, featureCode, checkFeatureAccess]);

  return {
    hasAccess,
    loading,
    subscriptionInfo,
    featureInfo,
    currentTierInfo: subscriptionInfo ? getSubscriptionTierInfo(subscriptionInfo.tier) : null,
    nextTier: subscriptionInfo ? getNextTier(subscriptionInfo.tier) : null,
    nextTierInfo: subscriptionInfo ? getSubscriptionTierInfo(getNextTier(subscriptionInfo.tier)) : null,
    refreshAccess
  };
};

export default useFeatureAccess;


