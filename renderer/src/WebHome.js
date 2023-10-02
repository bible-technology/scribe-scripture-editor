'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getorPutAppLangage } from './core/projects/handleProfile';
import i18n from './translations/i18n';
import { getSupabaseSession } from '../../supabase';
import WebLogin from './components/Login/WebLogin';

const WebHome = () => {
  const [session, setSession] = useState();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const data = await getSupabaseSession();
      if (data.session) {
        setSession(data.session);
        const appLangCode = await getorPutAppLangage('get', data.session.user.email);
        if (i18n.language !== appLangCode) {
          i18n.changeLanguage(appLangCode);
        }
        router.push('/projects');
      }
    };

    checkSession();
  }, [router, session]);

  return (
    <WebLogin />);
};
export default WebHome;
