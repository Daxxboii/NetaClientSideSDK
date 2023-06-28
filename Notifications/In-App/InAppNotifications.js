// Load the Ably library
const Ably = require("ably");

// Create a Realtime instance and connection
const realtime = new Ably.Realtime(
  "V2GB_A.M-qo9w:hMGmmyIjHoiO-pmouaqOp2PAJ2W0vpdbkrEbb6sChjo"
);

//call on login
function SetupInAppNotifications(userPN) {
  // Once connected, get a specific Channel
  realtime.connection.once("connected", () => {
    const channel = realtime.channels.get(userPN);

    // Subscribe to all messages
    channel.subscribe((message) => {
      console.log("Received: " + message.data);
      //do something with the data
    });
  });
}

function SetupPushNotifs(token) {}
