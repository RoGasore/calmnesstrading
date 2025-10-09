import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
	id: number;
  avatar?: string;
	email: string;
	username: string;
	first_name?: string;
	last_name?: string;
	role?: string;
	is_staff?: boolean;
	is_customer_service?: boolean;
	is_admin_user?: boolean;
	phone?: string;
	telegram_username?: string;
	is_verified?: boolean;
	is_active?: boolean;
	created_at?: string;
	last_login?: string;
}

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<boolean>;
	register: (data: { username: string; email: string; password: string; first_name?: string; last_name?: string; confirm_url?: string }) => Promise<boolean>;
	logout: () => void;
	isAdmin: () => boolean;
	isAuthenticated: boolean;
	fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_CONFIG } from '@/config/api';

const API_BASE = API_CONFIG.BASE_URL;

let inMemoryAccessToken: string | null = null;

// Fonction pour sauvegarder le token d'accès
function saveAccessToken(token: string) {
	inMemoryAccessToken = token;
	localStorage.setItem('access_token', token);
}

// Fonction pour récupérer le token d'accès
function getAccessToken(): string | null {
	if (inMemoryAccessToken) {
		return inMemoryAccessToken;
	}
	const saved = localStorage.getItem('access_token');
	if (saved) {
		inMemoryAccessToken = saved;
		return saved;
	}
	return null;
}

// Fonction pour supprimer les tokens
function clearTokens() {
	inMemoryAccessToken = null;
	localStorage.removeItem('access_token');
	localStorage.removeItem('refresh_token');
	localStorage.removeItem('user_profile');
}

async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
	const headers = new Headers(init?.headers || {});
	const token = getAccessToken();
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}
	const response = await fetch(input, { ...(init || {}), headers });
	if (response.status === 401) {
		const refreshed = await tryRefreshToken();
		if (refreshed) {
			const newToken = getAccessToken();
			if (newToken) {
				headers.set('Authorization', `Bearer ${newToken}`);
				return fetch(input, { ...(init || {}), headers });
			}
		}
	}
	return response;
}

async function tryRefreshToken(): Promise<boolean> {
	const refresh = localStorage.getItem('refresh_token');
	if (!refresh) return false;
	const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refresh })
	});
	if (!res.ok) {
		clearTokens();
		return false;
	}
	const data = await res.json();
	saveAccessToken(data.access);
	return true;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const initAuth = async () => {
			const savedUser = localStorage.getItem('user_profile');
			const savedRefreshToken = localStorage.getItem('refresh_token');
			const savedAccessToken = localStorage.getItem('access_token');
			
			console.log('🔐 Auth init:', { 
				hasUser: !!savedUser, 
				hasRefresh: !!savedRefreshToken, 
				hasAccess: !!savedAccessToken 
			});
			
			if (savedUser && savedRefreshToken) {
				try { 
					const userData = JSON.parse(savedUser);
					setUser(userData);
					
					// Restaurer le token d'accès s'il existe
					if (savedAccessToken) {
						inMemoryAccessToken = savedAccessToken;
						console.log('✅ Access token restored');
					} else {
						// Sinon essayer de le rafraîchir
						console.log('🔄 Refreshing token...');
						const refreshed = await tryRefreshToken();
						if (!refreshed) {
							console.warn('⚠️ Token refresh failed');
							setUser(null);
						}
					}
				} catch (error) { 
					console.error('❌ Auth init error:', error);
					clearTokens();
					setUser(null);
				}
			}
			
			setIsInitialized(true);
		};
		
		initAuth();
	}, []);

	// Afficher un loader pendant l'initialisation
	if (!isInitialized) {
		return <div className="min-h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
		</div>;
	}

	const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; errorType?: string }> => {
		console.log('🔐 Login attempt:', { email, password: '***', apiBase: API_BASE });
		const res = await fetch(`${API_BASE}/api/auth/login/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		console.log('📡 Login response:', res.status, res.statusText);
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			console.log('❌ Login error:', errorData);
			
			// Déterminer le type d'erreur
			let errorType = 'general';
			if (errorData.detail && errorData.detail.includes('non vérifié')) {
				errorType = 'unverified';
			} else if (res.status === 401) {
				errorType = 'credentials';
			}
			
			return { 
				success: false, 
				error: errorData.detail || 'Erreur de connexion',
				errorType 
			};
		}
		const data = await res.json();
		saveAccessToken(data.access);
		localStorage.setItem('refresh_token', data.refresh);
		setUser(data.user);
		localStorage.setItem('user_profile', JSON.stringify(data.user));
		return { success: true };
	};

	const register = async (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string; confirm_url?: string }): Promise<{ success: boolean; error?: string }> => {
		console.log('📝 Registration attempt:', { ...payload, password: '***', apiBase: API_BASE });
		const res = await fetch(`${API_BASE}/api/auth/register/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		console.log('📡 Registration response:', res.status, res.statusText);
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			console.log('❌ Registration error:', errorData);
			return { success: false, error: errorData.detail || 'Erreur lors de l\'inscription' };
		}
		
		return { success: true };
	};

	const logout = () => {
		clearTokens();
		setUser(null);
	};

	const isAdmin = () => Boolean(user?.is_staff);
	const isAuthenticated = user !== null;

	return (
		<AuthContext.Provider value={{ user, login, register, logout, isAdmin, isAuthenticated, fetchWithAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};