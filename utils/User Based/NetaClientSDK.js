//#region imports
const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("../AxiosSigned.js");
import jwt from 'jsonwebtoken';

import Geolocation from '@react-native-community/geolocation';
import geohash from 'latlon-geohash';


const path = require('path');
const mime = require('mime-types');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');


const crypto = require('crypto');

const LoginToCognito = require("./LoginToCognito")

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Cache = require('../Cache.js');
const KV = require('../KV.js');



var isOnboarding;
var onboardingScreenIndex = 0;
var endpoints;

async function _fetchOnboardingCache() {
    isOnboarding = Cache.getBoolean("isOnboarding")
    onboardingScreenIndex = Cache.getInt("onboardingScreenIndex")

    if (isOnboarding == undefined) Cache.set("isOnboarding", isOnboarding)
    if (onboardingScreenIndex == undefined) Cache.set("onboardingScreenIndex", onboardingScreenIndex)
}

async function fetchEndpoints() {
    endpoints = await Endpoints.fetch();
}

_fetchOnboardingCache()
fetchEndpoints()
//#endregion
// #region AuthenticatedUserActions
/// invoked to invite a user
/// context = "add", "invite", "share"
async function inviteUser(phoneNumber, context = "add") {
    try {
        // Check if onboarding is still happening
        if (isOnboarding) {
            console.error("User is still onboarding");
            return;
        }

        // Fetch jwt from cache
        const jwt = Cache.getString("jwt");
        if (!jwt) {
            console.error("No jwt in the cache");
            return;
        }

        // Prepare request url
        const url = endpoints["/invitations/invite"];

        // Prepare axios configuration
        const axiosConfig = {
            headers: {
                Authorization: 'Bearer ' + jwt
            },
            params: {
                invitee: phoneNumber,
                context
            }
        };

        // Send get request
        const response = await AxiosSigned.get(url, axiosConfig);

        if (response.data.success) {
            return { success: true, data: response.data };
        } else {
            return { success: false, message: response.data.message || "An error occurred while inviting the user" };
        }

    } catch (error) {
        console.error(error);
        return { success: false, message: error.message || "An error occurred while inviting the user" };
    }
}

async function OnPollRevealPartial(messageUID) {
    const QueryString = { messageUID: messageUID };
    const endpoint = endpoints["/OnPollRevealedPartial"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.get(endpoint, jwt, QueryString, null);
    return res;
}
async function OnPollReveal(messageUID) {
    const QueryString = { messageUID: messageUID };
    const endpoint = endpoints["/OnPollRevealed"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.get(endpoint, jwt, QueryString, null);
    return res;
}

async function ReadInbox(separator, messages) {
    const QueryString = { messages: messages, separator: separator };
    const endpoint = endpoints["/readInbox"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function RegisterPolls(polls) {
    const endpoint = endpoints["/registerPolls"];
    const jwt = Cache.getString("jwt");
    const QueryString = { polls: polls };
    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function FetchPollsNow() {
    const endpoint = endpoints["/fetchPollsNow"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.post(endpoint, jwt, null, null);
    return res;
}

// #endregion
//#region Friend System
async function OnFriendRequest(friendPN) {
    const QueryString = { friend: friendPN };
    const endpoint = endpoints["/friends/request"];
    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function AcceptFriendRequest(friendPN) {
    const endpoint = endpoints["/friends/accept"];
    const QueryString = { friend: friendPN };

    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function HideFriendRequestfriendPN(friendPN) {
    const endpoint = endpoints["/friends/hide"];
    const QueryString = { friend: friendPN };

    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function AddFriend(friendPN) {
    const endpoint = endpoints["/friends/add"];
    const QueryString = { friend: friendPN };

    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function RemoveFriend(friendPN) {
    const endpoint = endpoints["/friends/remove"];
    const QueryString = { friend: friendPN };

    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}
async function BlockFriend(friendPN) {
    const endpoint = endpoints["/friends/remove"];
    const QueryString = { friend: friendPN };

    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, QueryString, null);
    return res;
}

async function ResetBlockList() {
    const endpoint = endpoints["/friends/resetBlockList"];
    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, null, null);
    return res;

}

async function ResetHideList() {
    const endpoint = endpoints["/friends/resetHideList"];
    const jwt = Cache.getString("jwt");

    const res = await AxiosSigned.post(endpoint, jwt, null, null);
    return res;

}



// #endregion
//#region RegistrationFlow
async function submitAge(age) {
    if (onboardingScreenIndex != 0) return;
    Cache.set("age", age);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitGrade(grade) {
    if (onboardingScreenIndex != 1) return;
    Cache.set("grade", grade);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

/// TODO: get encoded geolocation from qparam 'clientlocation'
/// and also support paging via param pageToken and use return val nextPageToken
async function fetchSchools(schoolName = undefined) {
    if (onboardingScreenIndex != 2) return;

    // fetch the geolocation
    Geolocation.getCurrentPosition(async info => {
        const { latitude, longitude } = info.coords;
        const geohashValue = geohash.encode(latitude, longitude);
        Cache.set('geohash', geohashValue);

        // use the geohash value to get the schools
        const url = endpoints["/registration/fetchSchools"];
        const qstring = { clientlocation: geohashValue };
        if (schoolName != undefined) qString["queryname"] = schoolName;
        const response = await AxiosSigned.get(url, undefined, qstring);
        Cache.set("schools", JSON.stringify(response.data.rows));
        return response.data.rows;
    });
}
async function submitSchool(geohash) {
    if (onboardingScreenIndex != 2) return;
    Cache.set("school", geohash);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

/// Sends an OTP to the given phoneNumber
async function submitPhoneNumber(phoneNumber) {
    if (onboardingScreenIndex != 3) return;
    Cache.set("phoneNumber", phoneNumber)
    const url = endpoints["/verifypn/sendotp"];
    const qstring = { phoneNumber };
    const response = await AxiosSigned.get(url, undefined, qstring);
    return response.data.success;
}

/// submits an otp returns true if its accepted, else returns false
async function submitOTP(otp) {
    if (onboardingScreenIndex != 3) return;
    if (!phoneNumber) phoneNumber = Cache.getString("phoneNumber");
    const url = endpoints["/verifypn/verifyotp"];
    const qstring = { otp, phoneNumber };
    const response = await AxiosSigned.get(url, null, qstring);
    if (response.data.success || response.data.verified) {
        Cache.set("otp", otp);
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
        return true;
    } else {
        return false;
    }
}

/// Invoke by the user to check if their phone number is already verified
async function verifyStatus() {
    if (onboardingScreenIndex != 4) return;
    var phoneNumber = Cache.get("phoneNumber")
    const url = endpoints["/verifypn/fetchStatus"]
    const qString = { phoneNumber, otp: Cache.getString("jwt") }
    const response = await AxiosSigned.get(url, null, qstring);
    if (response.data.success) {
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    }
    return response.data.success
}

async function submitFirstName(firstName) {
    if (onboardingScreenIndex != 5) return;
    Cache.set("firstName", firstName);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitLastName(lastName) {
    if (onboardingScreenIndex != 6) return;
    Cache.set("lastName", lastName);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitUsername(username) {
    if (onboardingScreenIndex != 7) return;
    Cache.set("username", username);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitGender(gender) {
    if (onboardingScreenIndex != 8) return;
    isOnboarding = false;
    Cache.set("isOnboarding", isOnboarding);
    Cache.set("gender", gender);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    const url = endpoints["/submitProfile"];
    const qstring = {
        username: Cache.get("username"),
        firstName: Cache.get("firstName"),
        lastName: Cache.get("lastName"),
        phoneNumber: Cache.get("phoneNumber"),
        highschool: Cache.get("highschool"),
        gender: Cache.get("gender"),
        age: Cache.get("age"),
        school: Cache.get("school"),
        otp: Cache.get("otp"),
        platform: Platform.OS
    };
    const response = await AxiosSigned.get(url, null, qstring);
    if (response.data.alreadySubmitted) {
        /// skip submittal
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    }
    const topicName = response.data.transactionId;
    Alby.setupAlbyWithChannel(topicName, handleSubmitProfileResponseAlby);
}

async function checkSubmitProfile() {
    if (onboardingScreenIndex != 8) return;
    const url = endpoints["/submitProfile/fetchStatus"];
    const response = await AxiosSigned.get(url);
    if (response.data.resolved) {
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    }
    return response.data.resolved;
}

async function handleSubmitProfileResponseAlby(data) {
    if (onboardingScreenIndex != 8) return;
    if (data.success) {
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
        login(Cache.get("username"), Cache.get("otp"));
    }
}

async function back() {
    if (onboardingScreenIndex > 0) {
        onboardingScreenIndex--;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    }
}

/// invoked by the client to submit his pfp given local path to an img
async function submitPFP(filePath) {
    if (onboardingScreenIndex != 9) return;
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    try {
        const file = await fs.readFile(filePath, { encoding: 'base64' }); // read file as base64
        const buffer = Buffer.from(file, 'base64'); // convert base64 to buffer
        const filename = path.basename(filePath); // get the filename with extension
        const mimetype = mime.lookup(filePath); // get the MIME type of the file

        const data = new FormData(); // create form data
        data.append('file', buffer, {
            filename: filename, // provide actual file name
            contentType: mimetype || 'application/octet-stream', // provide actual file type or default to 'application/octet-stream'
        });

        const response = await axios({
            method: 'POST',
            url: endpoints["/uploadpfp"],
            data: data,
            headers: {
                ...data.getHeaders(), // append form-data specific headers
                'Authorization': Cache.getString("jwt") // your custom authorization header
            },
        });

        console.log('File uploaded successfully: ', response.data);
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
}

async function fetchAddFriendsOnboarding(pagenumber = 1) {
    if (onboardingScreenIndex != 10) return;
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);

    const jwt = Cache.get("jwt");
    const url = endpoints["/onboarding/addfriends"];
    const response = await AxiosSigned.get(url, jwt, { pagenumber });
    if (response.success) {
        Cache.set("addFriendsOnboarding", JSON.stringify(response.data));
        Cache.set("addFriendsOnboardingNextPage", response.nextPage);
        return response.data;
    }
}

// auto page
async function fetchAllAddFriendsOnboardingPages() {
    let pagenumber = 1;
    let data = [];

    while (true) {
        const pageData = await fetchAddFriendsOnboarding(pagenumber);

        if (!pageData || pageData.length === 0) {
            break;
        }

        data = data.concat(pageData);
        pagenumber = Cache.get("addFriendsOnboardingNextPage");
    }
    return data;
}

//Example
//const contactsList = [{ Fname: 'John', Lname: 'Doe', favorite: true, pfp: 'C:/Users/Daxx/Downloads/mummy.png', }];
async function uploadUserContacts(username, contactsList) {
    const url = endpoints["/uploadUserContacts"];
    try {
        const form = new FormData();

        // Add username and contacts without profile pictures to the form data
        form.append('username', username);
        form.append('contactsList', JSON.stringify(contactsList.map(({ pfp, ...rest }) => rest)));

        // Add profile pictures to the form data
        contactsList.forEach((contact, index) => {
            if (contact.pfp) {
                form.append(`profilePicture${index}`, fs.createReadStream(contact.pfp));
            }
        });

        const response = await axios.put(url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Server response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending contact list:', error.message);
    }
}

//#endregion
//#region Refresh

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
        return { inboxData: response.data.inbox, unreadCount: response.data.unreadCount };
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

//#endregion
//#region LoginToCognito
let userPoolId, clientId;
async function fetch() {
    var { _userPoolId, _clientId } = await KV.fetch(["UserPoolId", ["ClientId"]])
    userPoolId = _userPoolId;
    clientId = _clientId;
}
fetch()

async function loginToCognito() {
    /// reset pagination keys for add and inbox
    Cache.set("pageKey", undefined);
    Cache.set("pageKeyAdd", undefined)
    if (Cache.getBoolean("isOnboarding") === false) return; // if onboarding do nothing

    var phoneNumber = Cache.getString("phoneNumber");
    var otp = Cache.getString("otp");

    const poolData = {
        UserPoolId: userPoolId,
        ClientId: clientId
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    const authenticationData = {
        Username: phoneNumber,
        Password: otp,
    };

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const userData = {
        Username: phoneNumber,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            const jwt = result.getIdToken().getJwtToken();
            // store jwt in Cache
            Cache.set("jwt", jwt);
        },

        onFailure: function (err) {
            console.error(`Error in login: ${err}`);
        }
    });
}




//#endregion
//#region LoginLogout
//// used to decrypt all Alby data
function decryptAES256(encryptedText, key) {
    const iv = encryptedText.slice(0, 16);
    const content = encryptedText.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


async function login() {
    await LoginToCognito();
    jwt = Cache.get("jwt")

    const url = endpoints["/login"];
    const response = await AxiosSigned.get(url, { jwt });
    loginFuncCache = JSON.stringify(response.data) /// cache login resp
    Cache.set("loginFuncCache", loginFuncCache)
    Cache.set("unreadCount", JSON.parse(loginFuncCache).unreadCount)
    Cache.set("albyChannelId", response.data.albyChannelId);
    Cache.set("albyDecryptionKey", response.data.albyDecryptionKey);
    Alby.setupAlbyWithChannel(response.data.albyChannelId, handleAlbyData);
    if (response.data.deleted != undefined) {
        var deleteNow = response.data.deleted;
        if (deleteNow) {
            return logoutAndDelete()
        } else {
            /// TODO: handle requested deletion by showing screen
        }
    } else if (response.waiting) {
        var secondsWaiting = Int.asInt(response.secondsWaiting)

        // setup a timer
        setTimeout(() => {
            // this block of code will be executed when 'secondsWaiting' has passed
            /// TODO: invoke fetchPollsNow
        }, secondsWaiting * 1000); // setTimeout takes time in milliseconds
    } else if (response.data.polls == undefined) {
        /// TODO: show screen that says "add friends" bc no polls are avail.
    }
    return response.data.polls;
}

async function logout() {
    isOnboarding = false;
    onboardingScreenIndex = 0;
    Cache.set("isOnboarding", isOnboarding)
    Cache.set("onboardingScreenIndex", onboardingScreenIndex)
}

/// invoked when login is clicked from splash
/// which basically invokes submit profile without any cached data
async function loginFromStart() {
    const response = await AxiosSigned.get(url, { phoneNumber: Cache.getString("phoneNumber") }, qstring);
    if (response.data.alreadySubmitted) {
        /// TODO: handle success by going to home screen
    } else {
        /// TODO: handle failure by allowing user to re-enter pn
    }
}

async function logoutAndDelete() {
    logout();
    /// reset isOnboarding to false and onboardingIndex to 0
    /// as well as jwt, otp and anything else set in cache
    isOnboarding = false;
    onboardingScreenIndex = 0;
    Cache.set("isOnboarding", isOnboarding)
    Cache.set("onboardingScreenIndex", onboardingScreenIndex)
    Cache.set("otp", undefined)
    Cache.set("phoneNumber", undefined)
    Cache.set("firstName", undefined)
    Cache.set("lastName", undefined)
    Cache.set("jwt", undefined)
    Cache.set("loginFuncCache", undefined);
    Cache.set("schools", undefined)
    Cache.set("requestPolls", undefined)
    Cache.set("pageKey", undefined)
    Cache.set("addPageKey", undefined)
}

const listeners = []
function addRealtimeListener(listener) {
    listeners.push(listener)
}

function removeRealtimeListener(listener) {
    listeners.pop(listener)
}

async function handleAlbyData(data) {
    data = decryptAES256(data, Cache.getString("albyDecryptionKey"))
    for (listener in listeners) listener(data)
}

//#endregion
//#region Analytics 
//event = { event: "Ni", phoneNumber: "734873487348", value: "ahshshs" }
async function SendAnalytics(event) {
    const endpoint = endpoints["/RecordEvent"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.get(endpoint, jwt, event, null);
    return res;
}

//#endregion


module.exports = {
    inviteUser,
    fetchCache,
    isOnboarding,
    submitPFP,
    fetchAddFriendsOnboarding,
    verifyStatus,
    submitAge,
    submitGrade,
    fetchSchools,
    submitSchool, fetchAllAddFriendsOnboardingPages,
    submitPhoneNumber,
    submitOTP,
    submitFirstName,
    submitLastName,
    submitUsername,
    submitGender,
    checkSubmitProfile,
    handleSubmittalSuccess,
    back,
    login,
    uploadEmojiContacts,
    uploadUserContacts,
    login,
    logout,
    logoutAndDelete,
    addRealtimeListener,
    removeRealtimeListener,
    loginToCognito,
    fetch,
    SendAnalytics
}