// YourComponent.js

import React, { useEffect } from 'react';
import { messaging } from './Firebase';

const YourComponent = () => {
  useEffect(() => {
    messaging.requestPermission()
      .then(async function() {
        const token = await messaging.getToken();
        console.log(token);
      })
      .catch(function(err) {
        console.log("Unable to get permission to notify.", err);
      });

    navigator.serviceWorker.addEventListener("message", (message) => console.log(message));

    messaging.onMessage((payload) => {
      console.log("Message received. ", payload);
      // ...
    });
  }, []);

  // ...

  return <div>Your component</div>
};

export default YourComponent;
