"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import Navigation from "@/components/navigation";

interface UserContextType {
  userRole: 'client' | 'expert' | 'admin' | null;
  subscriptionStatus: 'free' | 'premium' | null;
  creditsRemaining: number;
  fullName: string | null;
  email: string | null;
  loading: boolean;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a LayoutWrapper');
  }
  return context;
}

interface LayoutWrapperProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function LayoutWrapper({ children, showNavigation = true }: LayoutWrapperProps) {
  const { isSignedIn, userId } = useAuth();
  const [userData, setUserData] = useState({
    userRole: null as 'client' | 'expert' | 'admin' | null,
    subscriptionStatus: null as 'free' | 'premium' | null,
    creditsRemaining: 0,
    fullName: null as string | null,
    email: null as string | null,
    loading: false
  });

  const fetchUserData = async () => {
    if (!isSignedIn || !userId) {
      setUserData(prev => ({ ...prev, userRole: null, subscriptionStatus: null, loading: false }));
      return;
    }

    try {
      setUserData(prev => ({ ...prev, loading: true }));
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserData({
          userRole: data.user.role,
          subscriptionStatus: data.user.subscription_status,
          creditsRemaining: data.user.credits_remaining,
          fullName: data.user.full_name,
          email: data.user.email,
          loading: false
        });
      } else {
        console.error('Failed to fetch user data');
        setUserData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isSignedIn, userId]);

  const contextValue: UserContextType = {
    ...userData,
    refreshUserData: fetchUserData
  };

  if (!showNavigation) {
    return (
      <UserContext.Provider value={contextValue}>
        {children}
      </UserContext.Provider>
    );
  }

  // Don't show navigation for certain pages like authentication pages
  const shouldShowNavigation = isSignedIn && (
    !window.location.pathname.includes('/sign-in') &&
    !window.location.pathname.includes('/sign-up') &&
    !window.location.pathname.includes('/api/')
  );

  return (
    <UserContext.Provider value={contextValue}>
      <div className="min-h-screen">
        {shouldShowNavigation && (
          <Navigation
            userRole={userData.userRole || undefined}
            subscriptionStatus={userData.subscriptionStatus || undefined}
            creditsRemaining={userData.creditsRemaining}
          />
        )}
        <main className={!shouldShowNavigation ? "" : "pt-0"}>
          {children}
        </main>
      </div>
    </UserContext.Provider>
  );
}