const Cache = require("./Cache.js");
const Endpoints = require("./Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("./AxiosSigned.js");
import { Platform } from 'react-native';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';

const crypto = require('crypto');

async function inviteUser(phoneNumber) {
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
                phoneNumber
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


async function fetchInvitationData() {
    if (isOnboarding) return;
    try {
        const phoneNumber = Cache.getString("phoneNumber");
        if (!phoneNumber) {
            console.error("No phone number in the cache");
            return;
        }

        const url = endpoints["/invitations/fetch"];
        const response = await AxiosSigned.get(url, { phoneNumber });

        if (response.data.success) {
            const encryptedLink = response.data.link;
            const link = decryptAES256(encryptedLink, phoneNumber); //Assuming phone number is the key here
            return { success: true, link };
        } else {
            return { success: false, message: response.data.message || "No link found for this phone number" };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message || "An error occurred while fetching the invitation data" };
    }
}


function decryptAES256(encryptedText, key) {
    const iv = encryptedText.slice(0, 16);
    const content = encryptedText.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

var isOnboarding = true;
var onboardingScreenIndex = 0;
var endpoints;

async function fetchCache() {
    isOnboarding = Cache.getBoolean("isOnboarding")
    onboardingScreenIndex = Cache.getInt("onboardingScreenIndex")

    if (isOnboarding == undefined) Cache.set("isOnboarding", isOnboarding)
    if (onboardingScreenIndex == undefined) Cache.set("onboardingScreenIndex", onboardingScreenIndex)
}

async function fetchEndpoints() {
    endpoints = await Endpoints.fetch();
}

fetchCache()
fetchEndpoints()

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

/// invoked to fetch the schools cache or undefined
function fetchSchoolsCache() {
    return JSON.parse(Cache.getString("schools"))
}

async function fetchSchools(schoolName = undefined) {
    if (onboardingScreenIndex != 2) return;
    const url = endpoints["/registration/fetchSchools"];
    const qstring = { clientlocation: Cache.get('geohash') };
    if (schoolName != undefined) qString["queryname"] = schoolName
    const response = await AxiosSigned.get(url, undefined, qstring);
    Cache.set("schools", JSON.stringify(response.data.rows))
    return response.data.rows;
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
    const qstring = { otp };
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
    const qString = {phoneNumber}
    const response = await AxiosSigned.get(url, null, qstring);
    if (response.data.success)
    {
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

const path = require('path');
const mime = require('mime-types');

/// invoked by the client to submit his pfp given local path to an img
async function submitPFP(filePath) {
    if (onboardingScreenIndex != 9) return;
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    try {
        const file = await RNFS.readFile(filePath, 'base64');  // read file as base64
        const filename = path.basename(filePath);  // get the filename with extension
        const mimetype = mime.lookup(filePath);  // get the MIME type of the file

        const data = new FormData();  // create form data
        data.append('file', {
            name: filename,  // provide actual file name
            type: mimetype || 'application/octet-stream',  // provide actual file type or default to 'application/octet-stream'
            data: file  // file data in base64 format
        });

        const response = await axios({
            method: 'POST',
            url: endpoints["/uploadpfp"],
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data', // important header when uploading files
            },
        });

        console.log('File uploaded successfully: ', response.data);
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
}

function fetchOnboardingAddFriendsCache()
{
    return JSON.parse(Cache.getString("addFriendsOnboarding"))
}

/// invoke to get any cached data for the app
async function fetchAddFriendsOnboarding() {
    if (onboardingScreenIndex != 10) return;
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    /// TODO: implement and cache
    const jwt = Cache.get("jwt");
    const url = endpoints["/onboarding/addfriends"];
    const response = await AxiosSigned.get(url, {jwt});
    if (response.success)
    {
        Cache.set("addFriendsOnboarding", JSON.stringify(response.data))
        return response.data
    }

}

/// invoked by the user to refresh with either
/// home, all, add, inbox, profile, invite
async function refresh(screen = 'home') {
    await _login();
    const jwt = Cache.get("jwt");
    const url = endpoints["/refresh"];
    const response = await AxiosSigned.get(url, {jwt, requestedScreen : screen});

    // Cache and setup Alby
    Cache.set("albyChannelId", response.data.albyChannelId);
    Cache.set("albyDecryptionKey", response.data.albyDecryptionKey);
    Alby.setupAlbyWithChannel(response.data.albyChannelId, handleAlbyData);

    // Return the data based on the requested screen
    if (screen === 'all') {
        const {
            home, add, inbox, profile, invite, albyChannelId, albyDecryptionKey
        } = response.data;
        // Cache data
        Cache.set("homeData", home);
        Cache.set("addData", add);
        Cache.set("inboxData", inbox);
        Cache.set("profileData", {[response.requestedProfile]: profile});
        Cache.set("inviteData", invite);
        return { home, add, inbox, profile, invite, albyChannelId, albyDecryptionKey };
    } else if (screen === 'home') {
        // Cache data
        Cache.set("homeData", response.data.data);
        return response.data.data;
    } else if (screen === 'add') {
        // Cache data
        Cache.set("addData", response.data.data);
        return response.data.data;
    } else if (screen === 'inbox') {
        // Cache data
        Cache.set("inboxData", response.data.data);
        return response.data.data;
    } else if (screen === 'profile') {
        if (req.query.requestedProfile == undefined) {
            // Cache data
            Cache.set("profileData", {[response.requestedProfile]: response.data.userData});
            return response.data.userData;
        }
        // Cache data
        Cache.set("profileData", {[response.requestedProfile]: response.data.data});
        return response.data.data;
    } else if (screen === 'invite') {
        // Cache data
        Cache.set("inviteData", response.data.data);
        return response.data.data;
    }
}



var vals = await KV.fetch(["UserPoolId", "ClientId"])
const poolData = {
    UserPoolId : vals[0].value, // Your user pool id here
    ClientId : vals[1].value// Your client id here
  };

  var loginFuncCache = JSON.parse(Cache.getString("loginFuncCache"))

  /// called internally to authenticate the jwet only after onboarding complete
  async function _login() {
    if (isOnboarding) return;
    if (username == null) username = Cache.getString("phoneNumber");
    if (password == null) password = Cache.getString("otp");
  
    var jwt = Cache.getString("jwt");
    
    // Decode the token to check if it's expired
    const decodedJwt = jwt ? jwt.decode(jwt) : null;
    const isJwtExpired = decodedJwt ? jwt.isTokenExpired(decodedJwt) : true;
  
    if (!jwt || isJwtExpired) {
      const userPool = new CognitoUserPool(poolData);
      const userData = { Username : username, Pool : userPool };
      const cognitoUser = new CognitoUser(userData);
  
      const authenticationData = { Username : username, Password : password };
      const authenticationDetails = new AuthenticationDetails(authenticationData);
  
      jwt = await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            resolve(result.getIdToken().getJwtToken());
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      });
  
      // Cache the jwt token
      Cache.set("jwt", jwt);
    }
  }
  
  async function login() {
    await _login();
    jwt = Cache.get("jwt")
  
    const url = endpoints["/login"];
    const response = await AxiosSigned.get(url, {jwt});
    loginFuncCache = JSON.stringify(response.data) /// cache login resp
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
        Cache.set('requestPolls', true);
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
    const response = await AxiosSigned.get(url, {phoneNumber : Cache.getString("phoneNumber")}, qstring);
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
}

async function handleAlbyData(data) {
    data = decryptAES256(data, Cache.getString("albyDecryptionKey"))
}

module.exports = {
    isOnboarding,
    submitAge,
    submitGrade,
    fetchSchools,
    submitSchool,
    submitPhoneNumber,
    submitOTP,
    submitFirstName,
    submitLastName,
    submitUsername,
    submitGender,
    checkSubmitProfile,
    handleSubmittalSuccess,
    back,
    login
};
