import {
  BellIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import moment from 'moment';
import { t } from 'i18next';
import Notifications from './Notifications';
import menuStyles from '../../layouts/editor/MenuBar.module.css';
import { AutographaContext } from '../context/AutographaContext';

const CustomNofications = () => {
  const [notifications, setNotification] = useState([]);
  const [openSideNotification, setOpenSideNotification] = useState(false);
  const {
    states: { activeNotificationCount },
    action: { setNotifications, setActiveNotificationCount },
  } = useContext(AutographaContext);

  useEffect(() => {
    const fetchNotifications = () => {
      localforage.getItem('notification').then((value) => {
        const notificationList = value || [];
        setNotification(notificationList);
        const unread = notificationList.filter((n) => !n.isRead).length;
        setActiveNotificationCount(unread);
      });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [setActiveNotificationCount]);

  function sortFunction(a, b) {
    const dateA = new Date(a.time).getTime();
    const dateB = new Date(b.time).getTime();
    return dateA < dateB ? 1 : -1;
  }

  const openSideBars = () => {
    localforage.getItem('notification').then((value) => {
      const _val = [...(value || [])].sort(sortFunction);

      const updatedNotifications = _val.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      setNotification(updatedNotifications);

      localforage.setItem('notification', updatedNotifications).then(() => {
        setNotifications(updatedNotifications);
        setActiveNotificationCount(0);
      });
    });
    setOpenSideNotification(true);
  };

  const closeNotifications = () => {
    setOpenSideNotification(false);
  };

  const clearAllNotifications = () => {
    localforage.removeItem('notification').then(() => {
      setNotification([]);
      setNotifications([]);
      setActiveNotificationCount(0);
    });
  };

  const removeNotification = (time) => {
    const updated = notifications.filter((n) => n.time !== time);
    setNotification(updated);
    localforage.setItem('notification', updated).then(() => {
      setNotifications(updated);
      const unreadNotifications = updated.filter((n) => !n.isRead);
      setActiveNotificationCount(unreadNotifications.length);
    });
  };
  return (
    <>
      <div className="relative inline-block">
        <button
          aria-label="notification-button"
          onClick={openSideBars}
          type="button"
          title={t('tooltip-editor-notification')}
          className={`group ${menuStyles.btn}`}
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {activeNotificationCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center px-1
      text-xxs leading-5 font-bold rounded-full bg-success text-white shadow"
          >
            {activeNotificationCount}
          </span>
        )}
      </div>

      <Notifications isOpen={openSideNotification} closeNotifications={closeNotifications}>

        <div className="w-80 max-w-xs">
          <div className="flex justify-between items-center mb-2 px-4">
            <button
              type="button"
              onClick={clearAllNotifications}
              className="text-xs text-red-500 hover:bg-red-500 hover:text-white hover:rounded px-2 py-1 transition-colors"
            >
              {t('label-clear-all')}
            </button>
          </div>
          {notifications?.map((val) => (
            <div key={val.time} className="relative mb-2" aria-label="notification">
              <button
                type="button"
                onClick={() => removeNotification(val.time)}
                className="absolute top-5 right-2 z-10 p-1 rounded-full bg-white hover:bg-gray-200 shadow"
              >
                <XMarkIcon className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </button>
              {!val.isRead && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full" />
              )}
              {val.type === 'success' && (
                <div className="relative mb-2 bg-gray-200 rounded-lg text-sm text-black overflow-hidden">
                  <div className="flex justify-between px-4 py-1 text-xs uppercase font-semibold bg-gray-300 text-gray-700">
                    {val.title}
                    <span className="opacity-100 text-xxs text-gray-400">
                      {moment(val.time, 'YYYY-MM-DD h:mm:ss').fromNow()}
                    </span>
                  </div>
                  <p className="px-4 py-2">{val.text}</p>
                </div>
              )}
              {val.type === 'failure' && (
                <div className="relative mb-2 bg-validation rounded-lg text-sm text-black">
                  <div className="flex justify-between px-4 py-1 text-xs uppercase font-semibold bg-secondary text-error rounded-t">
                    {val.title}
                    <span className="opacity-100 text-xxs text-gray-500">
                      {moment(val.time, 'YYYY-MM-DD h:mm:ss').fromNow()}
                    </span>
                  </div>
                  <p className="px-4 py-2 border-error border border-t-0 border-opacity-30 rounded-b">
                    {val.text}
                  </p>
                </div>
              )}
              {val.type === 'progress' && (
                <div className="relative mb-2 bg-light rounded-lg text-sm text-black">
                  <div className="flex justify-between px-4 py-1 text-xs uppercase font-semibold bg-secondary text-primary rounded-t">
                    {val.title}
                    <span className="opacity-100 text-xxs text-gray-500">
                      {moment(val.time, 'YYYY-MM-DD h:mm:ss').fromNow()}
                    </span>
                  </div>
                  <p className="px-4 py-2 border-primary border border-t-0 border-opacity-30 rounded-b">
                    {t('label-uploading-files')}
                    <span className="block m-auto bg-black h-2 mt-2 mb-4 mx-10 rounded-full">
                      <span className="block w-2/2 bg-primary h-2 rounded-full">&nbsp;</span>
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Notifications>
    </>
  );
};

export default CustomNofications;
