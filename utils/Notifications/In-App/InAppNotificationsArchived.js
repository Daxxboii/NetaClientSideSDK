const Ably = require("ably");
let timer;

const realtime = new Ably.Realtime("V2GB_A.M-qo9w:hMGmmyIjHoiO-pmouaqOp2PAJ2W0vpdbkrEbb6sChjo");

function setupInAppNotifications(userPN) {
    // Cancel any pending disconnection
    if (timer) clearTimeout(timer);

    // If the connection is not already established, connect to Ably and set up the subscription
    if (realtime.connection.state !== 'connected' && realtime.connection.state !== 'connecting') {
        const channel = realtime.channels.get(userPN);
        channel.subscribe((message) => {
            console.log("Received: " + message.data);
            //do something with the data
        });
    }
}

function tearDownInAppNotifications() {
    // Set up a timer to disconnect from Ably after 60 seconds
    timer = setTimeout(() => {
        // Close the connection
        realtime.connection.close();
    }, 60000);
}
