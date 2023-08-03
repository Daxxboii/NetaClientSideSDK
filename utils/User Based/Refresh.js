const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("../AxiosSigned.js");
import jwt from "jsonwebtoken";

const LoginToCognito = require("./LoginToCognito")



fetchEndpoints();

/// TODO: LoginToCognito resets inboxData.pageKey and pageKey and addPageKey 

/// invoked by the user to refresh with either
/// home, all, add, inbox, profile, invite
/// page is for 'add' only and is stored in cache 'nextPageKey'
async function fetch(screen = "home") {
  await LoginToCognito();
  const jwt = Cache.get("jwt");
  const url = endpoints["/refresh"];
  var qStrng = {
    jwt,
    requestedScreen: screen,
  }
  if (screen == "inbox" && Cache.getString("pageKey") != undefined) {
    qStrng.page = Cache.getString("pageKey")
  } else if (screen == "add" && Cache.get("addPageKey") != undefined) {
    qStrng.page = Cache.getString("addPageKey")
  }
  const response = await AxiosSigned.get(url, qStrng);;

  // Cache and setup Alby
  Cache.set("albyChannelId", response.data.albyChannelId);
  Cache.set("albyDecryptionKey", response.data.albyDecryptionKey);
  Alby.setupAlbyWithChannel(response.data.albyChannelId, handleAlbyData);

  // Return the data based on the requested screen
  if (screen === "all") {
    const {
      home,
      add,
      inbox,
      profile,
      invite,
      albyChannelId,
      albyDecryptionKey,
    } = response.data;
    // Cache data
    Cache.set("homeData", home);
    Cache.set("addData", add);
    Cache.set("inboxData", inbox);
    Cache.set("profileData", { [response.requestedProfile]: profile });
    Cache.set("inviteData", invite);
    Cache.set("FriendRequests", response.data.profile.friendRequests.count);
    return {
      home,
      add,
      inbox,
      profile,
      invite,
      albyChannelId,
      albyDecryptionKey,
      FriendRequestsCount: response.data.profile.friendRequests.count,
    };
  } else if (screen === "home") {
    // Cache data
    Cache.set("homeData", response.data.data);
    return response.data.data;
  } else if (screen === "add") {
    // Cache data
    const addData = response.data.data;
    Cache.set("addData", addData);
    if (response.data.nextPage) Cache.set("addPageKey", response.data.nextPage);
    return addData;
} else if (screen === "inbox") {
    // Cache data
    Cache.set("inboxData", response.data.data);
    if (response.data.nextPageKey) Cache.set("pageKey", response.data.nextPageKey);
    Cache.set("unreadCount", response.data.unreadCount)
    return {inboxData: response.data.inbox, unreadCount: response.data.unreadCount};
  } else if (screen === "profile") {
    if (req.query.requestedProfile == undefined) {
      // Cache data
      Cache.set("profileData", {
        [response.requestedProfile]: response.data.userData,
      });
      return response.data.userData;
    }
    // Cache data
    Cache.set("profileData", {
      [response.requestedProfile]: response.data.data,
    });
    return response.data.data;
  } else if (screen === "invite") {
    // Cache data
    Cache.set("inviteData", response.data.data);
    return response.data.data;
  }
}

exports.module = {fetch}