import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
	id: number;
  avatar: string;
	email: string;
	username: string;
	first_name?: string;
	last_name?: string;
	is_staff?: boolean;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

let inMemoryAccessToken: string | null = null;

async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
	const headers = new Headers(init?.headers || {});
	if (inMemoryAccessToken) {
		headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
	}
	const response = await fetch(input, { ...(init || {}), headers });
	if (response.status === 401) {
		const refreshed = await tryRefreshToken();
		if (refreshed && inMemoryAccessToken) {
			headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
			return fetch(input, { ...(init || {}), headers });
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
		localStorage.removeItem('refresh_token');
		inMemoryAccessToken = null;
		return false;
	}
	const data = await res.json();
	inMemoryAccessToken = data.access;
	return true;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const savedUser = localStorage.getItem('user_profile');
		if (savedUser) {
			try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('user_profile'); }
		}
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		const res = await fetch(`${API_BASE}/api/auth/login/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.detail || 'Erreur de connexion');
		}
		const data = await res.json();
		inMemoryAccessToken = data.access;
		localStorage.setItem('refresh_token', data.refresh);
		setUser(data.user);
		localStorage.setItem('user_profile', JSON.stringify(data.user));
		return true;
	};

	const register = async (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string; confirm_url?: string }): Promise<boolean> => {
		const res = await fetch(`${API_BASE}/api/auth/register/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		return res.ok;
	};

	const logout = () => {
		inMemoryAccessToken = null;
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('user_profile');
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