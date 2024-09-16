const { Notification } = window.require('@electron/remote');

export default function useSystemNotification() {
  const pushNotification = (title, body) => {
    const path = require('path');

    // console.log(Notification.isSupported());
    // if (window.process.platform === 'win32') {
    //     app.setAppUserModelId(app.name);
    //   }

    const options = {
      title,
      body,
      silent: false,
      icon: path.join(window.process.cwd(), '/styles/Logo.png'),
      timeoutType: 'default',
      urgency: 'critical',
      closeButtonText: 'Close Button',
    };

    new Notification(options).show();
  };

  return { pushNotification };
}
