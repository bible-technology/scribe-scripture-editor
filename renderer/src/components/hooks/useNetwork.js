import { useEffect, useState } from 'react';

function getNetworkConnection() {
  return (
    navigator.connection
    || navigator.mozConnection
    || navigator.webkitConnection
    || null
  );
}
function getNetworkConnectionInfo() {
  const connection = getNetworkConnection();
  if (!connection) {
    return {};
  }
  return {
    rtt: connection.rtt,
    type: connection.type,
    saveData: connection.saveData,
    downLink: connection.downLink,
    downLinkMax: connection.downLinkMax,
    effectiveType: connection.effectiveType,
  };
}

function useNetwork() {
  const [network, setNetwork] = useState(() => ({
    since: undefined,
    // online: navigator?.onLine,
    online: window.navigator.onLine,
    ...getNetworkConnectionInfo(),
  }));

  useEffect(() => {
    const handleOnline = () => {
      setNetwork((prevState) => ({
        ...prevState,
        online: true,
        since: new Date().toString(),
      }));
    };
    const handleOffline = () => {
      setNetwork((prevState) => ({
        ...prevState,
        online: false,
        since: new Date().toString(),
      }));
    };
    const handleConnectionChange = () => {
      setNetwork((prevState) => ({
        ...prevState,
        ...getNetworkConnectionInfo(),
      }));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const connection = getNetworkConnection();
    connection?.addEventListener('change', handleConnectionChange);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connection?.removeEventListener('change', handleConnectionChange);
    };
  }, []);
  return network;
}
export default useNetwork;
