import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode | null;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userData");
    if (!token) {
      router.push("/login_register");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing or a loading spinner if needed
  }

  return <>{children}</>;
}
