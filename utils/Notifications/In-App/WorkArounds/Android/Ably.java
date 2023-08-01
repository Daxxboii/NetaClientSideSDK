import android.app.Application;
import android.os.Handler;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;
import androidx.lifecycle.ProcessLifecycleOwner;

public class Ably extends Application {
    private AblyService ablyService;
    private Handler stopServiceHandler = new Handler();
    private Runnable stopServiceRunnable = new Runnable() {
        @Override
        public void run() {
            if (ablyService != null) {
                ablyService.stopSelf();
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();

        ablyService = new AblyService();

        // Create the observer which updates the UI.
        LifecycleObserver observer = new LifecycleObserver() {
            @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
            public void onMoveToBackground() {
                // App moved to background
                stopServiceHandler.postDelayed(stopServiceRunnable, 60000);  // Delay 60 seconds
            }

            @OnLifecycleEvent(Lifecycle.Event.ON_START)
            public void onMoveToForeground() {
                // App moved to foreground
                stopServiceHandler.removeCallbacks(stopServiceRunnable);  // Cancel the countdown
            }
        };

        // Add observer into the lifecycle of the whole application.
        ProcessLifecycleOwner.get().getLifecycle().addObserver(observer);
    }
}
