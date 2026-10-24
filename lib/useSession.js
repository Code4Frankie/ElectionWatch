'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { session } from './api';

// Returns the logged-in user, or sends the visitor to the login page.
export function useSession() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const s = session.get();
    if (!s?.user) router.replace('/login');
    else setUser(s.user);
  }, [router]);
  return user;
}
