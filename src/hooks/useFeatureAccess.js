import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
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
        const response = await axios.get(
          `${API_BASE_URL}users/feature-access/?club_id=${selectedClubId}&t=${Date.now()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const { feature_access, subscription_tier, subscription_active } = response.data;
        setHasAccess(feature_access[featureCode] || false);
        setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
        
        // Get feature info
        await getFeatureInfo();
      } else {
        setHasAccess(false);
        setSubscriptionInfo({ tier: 'basic', active: false });
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
      setSubscriptionInfo({ tier: 'basic', active: false });
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
          'Full Time Posts'
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
      }
    };
    return tiers[tier] || tiers.basic;
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
