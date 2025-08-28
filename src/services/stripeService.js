import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
  : 'http://localhost:8000/api/';

const stripeService = {
  /**
   * Create a Stripe checkout session for subscription upgrade
   * @param {string} tier - The subscription tier (basic, semipro, prem)
   * @param {number} clubId - The club ID
   * @returns {Promise} - Returns the checkout session URL
   */
  createCheckoutSession: async (tier, clubId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/stripe/checkout/`,
        {
          tier,
          club_id: clubId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  /**
   * Create a Stripe billing portal session
   * @param {number} clubId - The club ID
   * @returns {Promise} - Returns the billing portal URL
   */
  createBillingPortalSession: async (clubId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/stripe/billing-portal/`,
        {
          club_id: clubId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  },

  /**
   * Redirect to Stripe checkout
   * @param {string} tier - The subscription tier
   * @param {number} clubId - The club ID
   */
  redirectToCheckout: async (tier, clubId) => {
    try {
      const { url } = await stripeService.createCheckoutSession(tier, clubId);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  },

  /**
   * Redirect to Stripe billing portal
   * @param {number} clubId - The club ID
   */
  redirectToBillingPortal: async (clubId) => {
    try {
      const { url } = await stripeService.createBillingPortalSession(clubId);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to billing portal:', error);
      throw error;
    }
  }
};

export default stripeService;
