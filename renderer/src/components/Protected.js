'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseUser } from '../../../supabase';

const ProtectedRoute = ({ children }) => {
    const router = useRouter();
    useEffect(() => {
        const checkUser = async () => {
            const user = await getSupabaseUser();
            if (!user) {
                router.push('/login'); // Redirect to the sign in page if user is not signed in
            }
        };
        checkUser();
    }, [router]);
    return <div>{children}</div>;
};
export default ProtectedRoute;
