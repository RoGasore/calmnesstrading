import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// ==================== TYPES ====================

export interface Offer {
  id: number;
  name: string;
  description: string;
  offer_type: 'subscription' | 'formation' | 'signal' | 'account';
  price: number;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactChannel {
  id: number;
  channel_type: 'whatsapp' | 'telegram' | 'discord' | 'email';
  contact_info: string;
  contact_link: string;
  is_active: boolean;
  display_order: number;
  instructions: string;
}

export interface PendingPayment {
  id: number;
  user: number;
  user_id: number;
  user_email: string;
  user_username: string;
  user_first_name: string;
  user_last_name: string;
  offer: number;
  offer_name: string;
  offer_type: string;
  contact_method: string;
  contact_method_display: string;
  contact_info: string;
  amount: number;
  currency: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  status_display: string;
  created_at: string;
  updated_at: string;
  admin_notes: string;
  validated_by: number | null;
  validated_by_email: string | null;
  validated_at: string | null;
}

export interface Payment {
  id: number;
  user: number;
  user_id: number;
  user_email: string;
  user_username: string;
  offer: number;
  offer_name: string;
  offer_type: string;
  pending_payment: number | null;
  amount: number;
  currency: string;
  payment_method: string;
  payment_method_display: string;
  status: 'completed' | 'refunded' | 'expired';
  status_display: string;
  paid_at: string;
  transaction_id: string;
  validated_by: number | null;
  validated_by_email: string | null;
  admin_notes: string;
}

export interface Subscription {
  id: number;
  user: number;
  user_id: number;
  user_email: string;
  offer: number;
  offer_name: string;
  offer_type: string;
  payment: number;
  payment_amount: number;
  payment_date: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  status_display: string;
  telegram_added: boolean;
  discord_added: boolean;
  is_active_now: boolean;
  days_remaining: number;
  hours_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface UserDashboard {
  active_subscriptions: Subscription[];
  payment_history: Payment[];
  pending_payments: PendingPayment[];
  total_spent: number;
}

export interface AdminDashboard {
  pending_payments_count: number;
  contacted_payments_count: number;
  total_revenue: number;
  active_subscriptions_count: number;
  expiring_soon_count: number;
  recent_pending_payments: PendingPayment[];
}

// ==================== CONTEXT ====================

interface PaymentContextType {
  // Offres
  offers: Offer[];
  fetchOffers: () => Promise<void>;
  fetchOffersByType: (type: string) => Promise<Offer[]>;
  
  // Canaux de contact
  contactChannels: ContactChannel[];
  fetchContactChannels: () => Promise<void>;
  
  // Paiements en attente (utilisateur)
  createPendingPayment: (data: {
    offer: number;
    contact_method: string;
    contact_info: string;
    amount: number;
    currency: string;
  }) => Promise<PendingPayment | null>;
  
  // Dashboard utilisateur
  userDashboard: UserDashboard | null;
  fetchUserDashboard: () => Promise<void>;
  
  // Dashboard admin
  adminDashboard: AdminDashboard | null;
  fetchAdminDashboard: () => Promise<void>;
  
  // Paiements en attente (admin)
  adminPendingPayments: PendingPayment[];
  fetchAdminPendingPayments: (status?: string) => Promise<void>;
  validatePendingPayment: (pendingPaymentId: number, transactionId?: string, adminNotes?: string) => Promise<boolean>;
  cancelPendingPayment: (pendingPaymentId: number) => Promise<boolean>;
  
  loading: boolean;
  error: string | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [contactChannels, setContactChannels] = useState<ContactChannel[]>([]);
  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null);
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboard | null>(null);
  const [adminPendingPayments, setAdminPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== OFFRES ====================

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE}/api/payments/offers/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des offres');
      }
      const data = await response.json();
      setOffers(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchOffersByType = useCallback(async (type: string): Promise<Offer[]> => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE}/api/payments/offers/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des offres');
      }
      const data: Offer[] = await response.json();
      return data.filter(offer => offer.offer_type === type);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // ==================== CANAUX DE CONTACT ====================

  const fetchContactChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE}/api/payments/contact-channels/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des canaux de contact');
      }
      const data = await response.json();
      setContactChannels(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ==================== PAIEMENTS EN ATTENTE (UTILISATEUR) ====================

  const createPendingPayment = useCallback(async (data: {
    offer: number;
    contact_method: string;
    contact_info: string;
    amount: number;
    currency: string;
  }): Promise<PendingPayment | null> => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/pending-payments/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création du paiement en attente');
      }
      
      const pendingPayment = await response.json();
      toast({
        title: "Paiement en attente créé",
        description: "Votre demande de paiement a été enregistrée. Contactez le service client pour finaliser.",
      });
      return pendingPayment;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast]);

  // ==================== DASHBOARD UTILISATEUR ====================

  const fetchUserDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/dashboard/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du dashboard');
      }
      const data = await response.json();
      setUserDashboard(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast]);

  // ==================== DASHBOARD ADMIN ====================

  const fetchAdminDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/dashboard/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du dashboard admin');
      }
      const data = await response.json();
      setAdminDashboard(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast]);

  // ==================== PAIEMENTS EN ATTENTE (ADMIN) ====================

  const fetchAdminPendingPayments = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = status 
        ? `/api/payments/admin/pending-payments/?status=${status}`
        : '/api/payments/admin/pending-payments/';
      
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paiements en attente');
      }
      const data = await response.json();
      setAdminPendingPayments(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast]);

  const validatePendingPayment = useCallback(async (
    pendingPaymentId: number,
    transactionId?: string,
    adminNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/pending-payments/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pending_payment_id: pendingPaymentId,
          transaction_id: transactionId || '',
          admin_notes: adminNotes || '',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la validation du paiement');
      }
      
      toast({
        title: "Paiement validé",
        description: "Le paiement a été validé avec succès.",
      });
      
      // Rafraîchir les données
      await fetchAdminPendingPayments();
      await fetchAdminDashboard();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast, fetchAdminPendingPayments, fetchAdminDashboard]);

  const cancelPendingPayment = useCallback(async (pendingPaymentId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetchWithAuth(`${API_BASE}/api/payments/admin/pending-payments/${pendingPaymentId}/cancel/`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'annulation du paiement');
      }
      
      toast({
        title: "Paiement annulé",
        description: "Le paiement a été annulé avec succès.",
      });
      
      // Rafraîchir les données
      await fetchAdminPendingPayments();
      await fetchAdminDashboard();
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, toast, fetchAdminPendingPayments, fetchAdminDashboard]);

  const value = {
    offers,
    fetchOffers,
    fetchOffersByType,
    contactChannels,
    fetchContactChannels,
    createPendingPayment,
    userDashboard,
    fetchUserDashboard,
    adminDashboard,
    fetchAdminDashboard,
    adminPendingPayments,
    fetchAdminPendingPayments,
    validatePendingPayment,
    cancelPendingPayment,
    loading,
    error,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

