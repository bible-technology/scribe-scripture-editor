import { AutographaContext } from '@/components/context/AutographaContext';
import moment from 'moment';
import { useContext } from 'react';
import localforage from 'localforage';

export default function useAddNotification() {
  const {
    action: {
      setNotifications,
    },
  } = useContext(AutographaContext);

  const addNotification = async (title, text, type) => {
    localforage.getItem('notification').then((value) => {
      const temp = [...value];
      temp.push({
        title,
        text,
        type,
        time: moment().format(),
        hidden: true,
      });
      setNotifications(temp);
    });
  };

  return { addNotification };
}
