import { useEffect, useState } from 'react';
import localforage from 'localforage';
import * as logger from '../../logger';

// custom hook to fetch username from localforage
export const useGetUserName = () => {
  const [username, setUsername] = useState('');
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const value = await localforage.getItem('userProfile');
        setUsername(value?.username);
      } catch (error) {
        logger.error('useGetUserName.js', error);
      }
    };
    fetchUserName();
  }, [username]);
  return { username };
};
