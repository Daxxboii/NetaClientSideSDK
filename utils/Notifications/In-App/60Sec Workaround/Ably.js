import { NativeModules, DeviceEventEmitter } from 'react-native';

const AblyBridge = NativeModules.AblyBridge;

function setupAbly(apiKey, channelName) {
    AblyBridge.setup(apiKey, channelName);
    AblyBridge.connect();
}

function addAblyListener(listener) {
    DeviceEventEmitter.addListener('ReceivedMessage', listener);
}

function removeAlbyListener(listener)
{
    
}

function setupAblyWithChannel(channelName, listener) {
    const apiKey = "anal"
    AblyBridge.setup(apiKey, channelName);
    AblyBridge.connect();
    DeviceEventEmitter.addListener('ReceivedMessage', listener);
}

// Call AblyBridge.connect() when you want to connect
// Call AblyBridge.disconnect() when you want to disconnect after a 60 seconds delay

export { removeAlbyListener, setupAblyWithChannel, addAblyListener };
