'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  phoneNumber: string;
  role: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  fullName?: string;
  state: string;
  district: string;
  primaryLanguage: string;
  cropsGrown: string[];
  landAreaAcres: number;
  preferredMarket?: string;
  fpoName?: string;
}

interface AuthContextType {
  user: User | null;
  profile: FarmerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  isProfileDrawerOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; testOtp?: string; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<FarmerProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  // Check existing session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const profData = await res.json();
          setProfile({
            id: profData.id,
            userId: profData.user_id,
            fullName: profData.full_name,
            state: profData.state,
            district: profData.district,
            primaryLanguage: profData.primary_language,
            cropsGrown: profData.crops_grown || ['paddy'],
            landAreaAcres: profData.land_area_acres || 2.5,
            preferredMarket: profData.preferred_market,
            fpoName: profData.fpo_name
          });
          setUser({
            id: profData.user_id,
            phoneNumber: '+919840123456',
            role: 'farmer'
          });
        }
      } catch {
        // Guest mode
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const sendOtp = async (phone: string) => {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }
    return {
      success: true,
      testOtp: data.test_otp,
      message: data.message
    };
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid OTP code');
    }

    setUser({
      id: data.user.id,
      phoneNumber: data.user.phone_number,
      role: data.user.role
    });
    setProfile({
      id: data.profile.id,
      userId: data.profile.user_id,
      fullName: data.profile.full_name,
      state: data.profile.state,
      district: data.profile.district,
      primaryLanguage: data.profile.primary_language,
      cropsGrown: data.profile.crops_grown,
      landAreaAcres: data.profile.land_area_acres,
      preferredMarket: data.profile.preferred_market,
      fpoName: data.profile.fpo_name
    });
    setIsLoginModalOpen(false);
    return true;
  };

  const loginWithEmail = async (email: string) => {
    const res = await fetch('/api/auth/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login with email');
    }

    setUser({
      id: data.user.id,
      phoneNumber: data.user.phone_number,
      role: data.user.role
    });
    setProfile({
      id: data.profile.id,
      userId: data.profile.user_id,
      fullName: data.profile.full_name,
      state: data.profile.state,
      district: data.profile.district,
      primaryLanguage: data.profile.primary_language,
      cropsGrown: data.profile.crops_grown || ['paddy'],
      landAreaAcres: data.profile.land_area_acres || 2.5,
      preferredMarket: data.profile.preferred_market,
      fpoName: data.profile.fpo_name
    });
    setIsLoginModalOpen(false);
    return true;
  };

  const updateProfile = async (updates: Partial<FarmerProfile>) => {
    const payload: any = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.state !== undefined) payload.state = updates.state;
    if (updates.district !== undefined) payload.district = updates.district;
    if (updates.cropsGrown !== undefined) payload.crops_grown = updates.cropsGrown;
    if (updates.landAreaAcres !== undefined) payload.land_area_acres = updates.landAreaAcres;
    if (updates.preferredMarket !== undefined) payload.preferred_market = updates.preferredMarket;

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error('Failed to update profile');
    }
    const profData = await res.json();
    setProfile(prev => prev ? {
      ...prev,
      fullName: profData.full_name,
      state: profData.state,
      district: profData.district,
      cropsGrown: profData.crops_grown,
      landAreaAcres: profData.land_area_acres,
      preferredMarket: profData.preferred_market
    } : null);
    setIsProfileDrawerOpen(false);
    return true;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        isProfileDrawerOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        openProfileDrawer: () => setIsProfileDrawerOpen(true),
        closeProfileDrawer: () => setIsProfileDrawerOpen(false),
        sendOtp,
        verifyOtp,
        loginWithEmail,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
