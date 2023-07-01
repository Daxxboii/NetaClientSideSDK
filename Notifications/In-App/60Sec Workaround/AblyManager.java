package com.yourapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ViewManager;

import io.ably.lib.realtime.AblyRealtime;
import io.ably.lib.realtime.Channel;
import io.ably.lib.realtime.Channel.MessageListener;
import io.ably.lib.types.AblyException;
import io.ably.lib.types.Message;

import android.os.Handler;
import android.os.Looper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AblyBridge extends ReactContextBaseJavaModule {

    private static AblyRealtime ablyRealtime;
    private static Channel channel;

    AblyBridge(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AblyBridge";
    }

    @ReactMethod
    public void setup(String apiKey, String channelName) {
        try {
            this.ablyRealtime = new AblyRealtime(apiKey);
            this.channel = ablyRealtime.channels.get(channelName);

            channel.subscribe(new MessageListener() {
                @Override
                public void onMessage(Message message) {
                    // When a message is received, send an event to JavaScript with the message data
                    getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("ReceivedMessage", Arguments.makeNativeMap(message.data));
                }
            });

        } catch (AblyException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void connect() {
        ablyRealtime.connection.connect();
    }

    @ReactMethod
    public void disconnect() {
        // Create a Handler to delay the disconnection
        Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                ablyRealtime.connection.close();
            }
        }, 60000);  // Delay in milliseconds (60000 ms = 60 seconds)
    }
}

class AblyBridgePackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new AblyBridge(reactContext));

        return modules;
    }
}
