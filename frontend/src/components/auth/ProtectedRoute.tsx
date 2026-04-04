'use client';

import React, { useEffect } from 'react';
import { useAuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
    if (
      !loading &&
      isAuthenticated &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      router.push('/');
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  if (loading) {
    return <Loading fullPage message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
