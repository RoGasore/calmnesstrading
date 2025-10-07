import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isAuthenticated } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_BASE}/api/auth/user/notifications/?status=sent`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return { unreadCount, loading, refresh: fetchUnreadCount };
}

