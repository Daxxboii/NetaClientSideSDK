// index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as firebase from 'firebase/app';

ReactDOM.render(<App />, document.getElementById('root'));

navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    firebase.messaging().useServiceWorker(registration);
  });
