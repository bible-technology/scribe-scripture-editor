import { useEffect, useState } from 'react';
import localforage from 'localforage';
import * as logger from '../../logger';
import { supabase } from '../../../../supabase';

const IsElectron = process.env.NEXT_PUBLIC_IS_ELECTRON;

// custom hook to fetch username from localforage
export const useGetUserName = () => {
    const [username, setUsername] = useState('');
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (IsElectron) {
                    const value = await localforage.getItem('userProfile');
                    setUsername(value?.username);
                } else if (!IsElectron) {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) {
                        console.error(error);
                    }
                    if (session) {
                        setUsername(session?.user?.email);
                    }
                }
            } catch (error) {
                logger.error('useGetUserName.js', error);
            }
        };
        fetchUserName();
    }, [username]);
    return { username };
};
