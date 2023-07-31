const Ably = require("ably");
let timer;
const KV = require("../../KV.js");

const cache = require("../../Cache.js")

var realtime;
var channel;
async function SetupAbly(){
    const AblyKey = await KV.fetch("AblyAPIClientKey");
    realtime = new Ably.Realtime(AblyKey);
}

SetupAbly();

const decryption = require("../../Decryption.js");

// Keep track of subscribed channels
const subscribedChannels = new Set();

function setupInAppNotifications(transactionID, encryptionKey) {
    // Cancel any pending disconnection
    if (timer) clearTimeout(timer);

    // If the connection is not already established, connect to Ably and set up the subscription
    if (
        realtime.connection.state !== 'connected' &&
        realtime.connection.state !== 'connecting'
    ) {
        if (!subscribedChannels.has(transactionID)) {
            const channel = realtime.channels.get(transactionID);
            channel.subscribe(async (message) => {
                const data = await decryption.decrypt(message.data, encryptionKey);
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.inbox != null) {
                        /// CASE: poll sent to this user
                      // Get current cache data
                      let inboxData = Cache.get("inboxData") || [];
                      
                      // Combine the old data with the new data
                      inboxData = inboxData.concat(parsedData.inbox);
                      
                      // Sort the data in descending order by pushedTime
                      inboxData.sort((a, b) => b.pushedTime - a.pushedTime);
                      
                      // Store the sorted data back in cache
                      Cache.set("inboxData", inboxData);
                    } else if (parsedData.friends != undefined) {
                        /// case: event from friends for this user
                        var event = parsedData.friends.event; /// add, request, remove, accept
                        var friend = parsedData.friends.friend
                        var message = parsedData.friends.message // display this msg

                    }
                    console.log("Received: ", parsedData);
                    // Do something with the data
                  } catch (error) {
                    console.error("Error parsing the received data:", error);
                  }
                  
            });

            // Mark the channel as subscribed
            subscribedChannels.add(transactionID);
        } else {
            console.warn("Already subscribed to channel with ID:", transactionID);
            return;
        }
    }
}


function removeListener(){
    channel.unsubscribe();
}

function tearDownInAppNotifications() {
    // Set up a timer to disconnect from Ably after 60 seconds
    timer = setTimeout(() => {
        // Close the connection
        realtime.connection.close();
    }, 60000);
}

module.exports = {setupInAppNotifications,tearDownInAppNotifications,removeListener};