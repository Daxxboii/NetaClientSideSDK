import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set the minimum background fetch interval (e.g., 30 seconds)
        UIApplication.shared.setMinimumBackgroundFetchInterval(30)
        return true
    }

    // Background Fetch
    func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        // Perform background fetch tasks here, like checking for new messages
        // on the subscribed channel and processing them accordingly.
        
        // Call the completion handler when the background fetch is done
        completionHandler(.newData) // Use .noData or .failed if appropriate
    }

    // Handle Remote Notifications
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any]) {
        // Handle the push notification here, check for new messages on the
        // subscribed channel, and process them accordingly.
    }
}
