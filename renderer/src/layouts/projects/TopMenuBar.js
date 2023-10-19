/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Disclosure,
} from '@headlessui/react';
// import {
//   MenuIcon,
//   XMarkIcon,
// } from '@heroicons/react/24/outline';
import Notifications from '@/components/Notification/Notifications';
import UserProfile from '@/components/Profile/UserProfile';

export default function TopMenuBar() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const { t } = useTranslation();
  // function openSideBars() {
  //   setOpenSideBar(true);
  // }

  function closeNotifications(open) {
    setOpenSideBar(open);
  }
  return (
    <>
      <Disclosure as="nav" className="bg-secondary">
        {({ open }) => (
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="hidden md:block">
                  <div className="-ml-4 flex items-baseline space-x-4">
                    <span className="text-white px-3 py-2 text-lg tracking-wide font-bold uppercase">
                      {t('app-name')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {/* <button
                      onClick={openSideBars}
                      type="button"
                      className="inline-flex items-center
                      px-2 py-1 border border-transparent rounded-md shadow-sm
                        text-sm font-medium text-white bg-gray-800
                        hover:bg-gray-700 focus:outline-none
                        focus:ring-2 focus:ring-offset-2
                        focus:ring-offset-gray-800 focus:ring-gray-700"
                    >
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      <span className="px-2 ml-2 inline-flex
                      text-xs leading-5 font-semibold rounded-full bg-success text-white">21</span>
                    </button> */}

                  {/* Profile dropdown */}
                  <UserProfile />
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span className="sr-only">{t('label-main-menu')}</span>
                  {/* {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )} */}
                </Disclosure.Button>
              </div>
            </div>
          </div>
        )}
      </Disclosure>
      <Notifications isOpen={openSideBar} closeNotifications={closeNotifications}>
        notification
      </Notifications>
    </>
  );
}
