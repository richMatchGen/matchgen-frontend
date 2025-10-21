import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/config';

const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAdminStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if user has admin access via my-club endpoint
      const clubResponse = await apiClient.get('/users/my-club/');
      
      if (clubResponse.data.is_admin === true) {
        setIsAdmin(true);
        
        // Fetch admin dashboard data
        try {
          const adminResponse = await apiClient.get('/users/admin/dashboard/');
          setAdminData(adminResponse.data);
        } catch (adminError) {
          console.error('Error fetching admin dashboard data:', adminError);
          setError('Failed to load admin dashboard data');
        }
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to check admin status');
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllClubs = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/clubs/all/');
      return response.data;
    } catch (err) {
      console.error('Error fetching all clubs:', err);
      throw err;
    }
  }, []);

  const uploadGraphicPack = useCallback(async (formData, clubId) => {
    try {
      const response = await apiClient.post('/graphicpack/media/upload/', {
        ...formData,
        club_id: clubId
      });
      return response.data;
    } catch (err) {
      console.error('Error uploading graphic pack:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return {
    isAdmin,
    adminData,
    loading,
    error,
    checkAdminStatus,
    fetchAllClubs,
    uploadGraphicPack
  };
};

export default useAdmin;
