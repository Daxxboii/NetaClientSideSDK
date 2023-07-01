import { NativeModules, DeviceEventEmitter } from 'react-native';

const AblyBridge = NativeModules.AblyBridge;

AblyBridge.setup("YOUR_ABLY_API_KEY", "YOUR_CHANNEL_NAME");

DeviceEventEmitter.addListener('ReceivedMessage', function(event) {
    console.log(event);
});

// Call AblyBridge.connect() when you want to connect
// Call AblyBridge.disconnect() when you want to disconnect after a 60 seconds delay
