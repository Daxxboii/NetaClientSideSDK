const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("../AxiosSigned.js");
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';


const crypto = require('crypto');



//// used to decrypt all Alby data
function decryptAES256(encryptedText, key) {
    const iv = encryptedText.slice(0, 16);
    const content = encryptedText.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

async function _login() {
    if (Cache.getBoolean("isOnboarding") === false) return; // if onboarding do nothing

    var phoneNumber = Cache.getString("phoneNumber");
    var otp = Cache.getString("otp");
    
    // Add your User Pool Id and Client Id here
    const userPoolId = 'your_user_pool_id';
    const clientId = 'your_client_id';
    
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

        onFailure: function(err) {
            console.error(`Error in login: ${err}`);
        }
    });
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

exports.module = {login, logout, logoutAndDelete}