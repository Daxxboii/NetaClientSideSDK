// In your ViewController or wherever you handle the subscription
import UIKit

class YourViewController: UIViewController {

    // ...

    // Save the subscribedChannels set to UserDefaults
    func saveSubscribedChannelsToUserDefaults() {
        UserDefaults.standard.set(Array(subscribedChannels), forKey: "subscribedChannels")
    }

    // Load the subscribedChannels set from UserDefaults
    func loadSubscribedChannelsFromUserDefaults() {
        if let channelsArray = UserDefaults.standard.array(forKey: "subscribedChannels") as? [String] {
            subscribedChannels = Set(channelsArray)
        }
    }

    // ...
}
