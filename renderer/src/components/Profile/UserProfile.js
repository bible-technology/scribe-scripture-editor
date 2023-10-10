import { useContext, Fragment } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Menu, Transition,
} from '@headlessui/react';
import {
  UserIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@/util/classNames';
import { AuthenticationContext } from '@/components/Login/AuthenticationContextProvider';
import { useGetUserName } from '@/components/hooks/useGetUserName';
import { useRouter } from 'next/navigation';
import { isElectron } from '@/core/handleElectron';
import * as localforage from 'localforage';
import { supabaseSignout } from '../../../../supabase';

const UserProfile = () => {
  const { action: { logout } } = useContext(AuthenticationContext);
  const { t } = useTranslation();
  const profile = [t('label-your-profile')];
  const userPic = true;
  const router = useRouter();

  const signOut = async () => {
    // if(!process.env.NEXT_PUBLIC_IS_ELECTRON){
    const { error } = await supabaseSignout();
    localforage.removeItem('userProfile');
       // eslint-disable-next-line no-console
    error ? console.log({ error }) : router.push('/login');
  };
// }

  // get username from custom hook
  const { username } = useGetUserName();
  function truncateUsername(username) {
    if (username) {
      const atIndex = username.indexOf('@');
      if (atIndex !== -1) {
        const userName = username.slice(0, atIndex);
        return userName;
      }
      return null;
    }
  }
  return (
    <div>
      <Menu as="div" className="ml-3 relative z-10">
        {({ open }) => (
          <>
            <div>
              <Menu.Button
                id="user-profile"
                className="max-w-xs bg-gray-800 border-4 border-white rounded-full flex items-center text-sm
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-700"
              >
                <span className="sr-only">{t('label-user-menu')}</span>

                {/* check if user pic available  */}
                {userPic
                  ? (
                    <div className="h-8 w-8 p-2 bg-primary rounded-full">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )
                  : (
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  )}

              </Menu.Button>
            </div>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div aria-label="userName" className="flex items-center justify-center pb-2 text-sm text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isElectron() ? username : truncateUsername(username)}
                </div>
                {profile.map((item) => (
                  <Menu.Item key={item}>
                    {({ active }) => (
                      (
                        <Link
                          href="/profile"
                          id="profile"
                          aria-label="user-profile"
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          )}
                        >

                          {item}

                        </Link>
                      )
                    )}
                  </Menu.Item>
                ))}
                <Menu.Item>
                  {({ active }) => (
                    (
                      <Link
                        href="/"
                        id="signout"
                        aria-label="signout"
                        onClick={() => (isElectron() ? logout() : signOut())}
                        role="button"
                        tabIndex={0}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700',
                        )}
                      >

                        {t('btn-signout')}

                      </Link>
                    )

                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default UserProfile;
