const Cache = require("./Cache.js");
const Endpoints = require("./Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("./AxiosSigned.js");
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';

const crypto = require('crypto');

function decryptAES256(encryptedText, key) {
    const iv = encryptedText.slice(0, 16);
    const content = encryptedText.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

var isOnboarding;
var onboardingScreenIndex;
var endpoints;

async function fetchCache() {
    isOnboarding = Cache.getBoolean("isOnboarding")
    onboardingScreenIndex = Cache.getInt("onboardingScreenIndex")
}

async function fetchEndpoints() {
    endpoints = await Endpoints.fetch();
}

fetchCache()
fetchEndpoints()

async function submitAge(age) {
    Cache.set("age", age);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitGrade(grade) {
    Cache.set("grade", grade);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function fetchSchools(schoolName = undefined) {
    const url = endpoints["/registration/fetchSchools"];
    const qstring = { queryname: schoolName, clientlocation: Cache.get('geohash') };
    const response = await AxiosSigned.get(url, undefined, qstring);
    return response.data.rows;
}

async function submitSchool(geohash) {
    Cache.set("school", geohash);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitPhoneNumber(phoneNumber) {
    Cache.set("phoneNumber", phoneNumber)
    const url = endpoints["/verifypn/sendotp"];
    const qstring = { phoneNumber };
    const response = await AxiosSigned.get(url, undefined, qstring);
    return response.data.success;
}

async function submitOTP(phoneNumber, otp) {
    const url = endpoints["/verifypn/verifyotp"];
    const qstring = { otp };
    const response = await AxiosSigned.get(url, null, qstring);
    if (response.data.success) {
        Cache.set("otp", otp);
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
        return true;
    } else {
        return false;
    }
}

async function submitFirstName(firstName) {
    Cache.set("firstName", firstName);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitLastName(lastName) {
    Cache.set("lastName", lastName);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitUsername(username) {
    Cache.set("username", username);
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
}

async function submitGender(gender) {
    isOnboarding = false;
    Cache.set("isOnboarding", isOnboarding);
    Cache.set("gender", gender);
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
        otp: Cache.get("otp")
    };
    const response = await AxiosSigned.get(url, null, qstring);
    const topicName = response.data.transactionId;
    Alby.setupAlbyWithChannel(topicName, handleSubmitProfileResponseAlby);
}

async function checkSubmitProfile() {
    const url = endpoints["/submitProfile/fetchStatus"];
    const response = await AxiosSigned.get(url);
    if (response.data.resolved) {
        onboardingScreenIndex++;
        Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    }
    return response.data.resolved;
}

async function handleSubmitProfileResponseAlby(data) {
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

var vals = await KV.fetch(["UserPoolId", "ClientId"])
const poolData = {
    UserPoolId : vals[0].value, // Your user pool id here
    ClientId : vals[1].value// Your client id here
  };
  
  async function login(username = null , password = null) {
    if (username == null) username = Cache.getString("phoneNumber");
    if (password == null) password = Cache.getString("password");
  
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
  
    const url = endpoints["/login"];
    const response = await AxiosSigned.get(url, jwt);
    Cache.set("albyChannelId", response.data.albyChannelId);
    Cache.set("albyDecryptionKey", response.data.albyDecryptionKey);
    Alby.setupAlbyWithChannel(response.data.albyChannelId, handleAlbyData);
    return response.data.polls;
  }

async function logout() {
    /// reset isOnboarding to false and onboardingIndex to 0
    /// as well as jwt, otp and anything else set in cache
}

async function logoutAndDelete() {
    /// TODO: delete all data in cache
    logout();
}

async function handleAlbyData(data) {
    data = decryptAES256(data, albyDecryptionKey)
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
