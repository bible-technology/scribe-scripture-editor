import {
    BellIcon,
  } from '@heroicons/react/24/outline';
import React, { useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import moment from 'moment';
import { t } from 'i18next';
import Notifications from './Notifications';
import menuStyles from '../../layouts/editor/MenuBar.module.css';
import { AutographaContext } from '../context/AutographaContext';

const CustomNofications = () => {
    const [notifications, setNotification] = useState();
    const [openSideNotification, setOpenSideNotification] = useState(false);
    const {
      states: {
        activeNotificationCount,
      },
      action: {
        setNotifications,
        setActiveNotificationCount,
      },
    } = useContext(AutographaContext);

    useEffect(() => {
      localforage.getItem('notification').then((value) => {
        setNotification(value);
      });
    }, []);

    function sortFunction(a, b) {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return dateA < dateB ? 1 : -1;
    }

    function openSideBars() {
      localforage.getItem('notification').then((value) => {
        const _val = [...value];
        _val.sort(sortFunction);
        setNotification(_val);
        setActiveNotificationCount(0);
        if (_val.length > 10) {
          // setNotifications(_val);
          localforage.setItem('notification', _val.slice(0, 10)).then((val) => {
            setNotifications(val);
          });
        }
      });
      setOpenSideNotification(true);
    }

    function closeNotifications(open) {
        setOpenSideNotification(open);
        localforage.getItem('notification').then((value) => {
          const _notfication = [...value];
          _notfication.forEach((notify, index) => {
            value[index].hidden = false;
          });
          localforage.setItem('notification', value);
        });
    }

    return (
      <>
        <button
          aria-label="notification-button"
          onClick={openSideBars}
          type="button"
          title={t('tooltip-editor-notification')}
          className={`group ${menuStyles.btn}`}
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
          {(activeNotificationCount > 0) && (
            <span
              className="px-1 ml-1 inline-flex text-xxs leading-5 font-semibold rounded-full bg-success text-white group-hover:bg-white group-hover:text-primary "
            >
              {activeNotificationCount}
            </span>
          )}
        </button>
        <Notifications isOpen={openSideNotification} closeNotifications={closeNotifications}>
          <>
            {notifications?.map((val) => (
              <div key={val.time} aria-label="success-notification">
                {val.type === 'success' ? (
                  <div className={`${val.hidden ? '' : 'opacity-60'}  relative mb-2 bg-gray-200 rounded-lg text-sm text-black overflow-hidden`}>
                    <div className={`flex justify-between px-4 py-1 text-xs uppercase font-semibold bg-gray-300 text-gray-700 ${val.hidden ? '' : 'opacity-60'}`}>
                      {val.title}
                      <span className="opacity-100 text-xxs text-gray-400">
                        {moment(val.time, 'YYYY-MM-DD h:mm:ss').fromNow()}
                      </span>
                    </div>
                    <p aria-label={val.text} className="px-4 py-2">
                      {val.text}
                    </p>
                  </div>
                ) : (
                val.type === 'failure' && (
                <div className={`relative mb-2 bg-validation rounded-lg text-sm text-black ${val.hidden ? '' : 'opacity-60'}`}>
                  <div className={`flex justify-between px-4 py-1 text-xs uppercase font-semibold bg-secondary text-error rounded-t ${val.hidden ? '' : 'opacity-60'}`}>
                    {val.title}
                    <span className="opacity-100 text-xxs text-gray-500">
                      {moment(val.time, 'YYYY-MM-DD h:mm:ss').fromNow()}
                    </span>
                  </div>
                  <p className="px-4 py-2 border-error border border-t-0 border-opacity-30 rounded-b">{val.text}</p>
                </div>
                )
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
                      .
                      <span className="block m-auto bg-black h-2 mt-2 mb-4 mx-10 rounded-full">
                        <span className="block w-2/2 bg-primary h-2 rounded-full">&nbsp;</span>
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
            {/* (val.type === 'upload') && (

              ) */}

          </>
        </Notifications>
      </>
    );
  };

export default CustomNofications;
