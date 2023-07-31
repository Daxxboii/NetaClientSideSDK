const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("../AxiosSigned.js");
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';
import Geolocation from '@react-native-community/geolocation';
import geohash from 'latlon-geohash';
const path = require('path');
const mime = require('mime-types');

var isOnboarding = true;
var onboardingScreenIndex = 0;
var endpoints;

async function _fetchCache() {
    isOnboarding = Cache.getBoolean("isOnboarding")
    onboardingScreenIndex = Cache.getInt("onboardingScreenIndex")

    if (isOnboarding == undefined) Cache.set("isOnboarding", isOnboarding)
    if (onboardingScreenIndex == undefined) Cache.set("onboardingScreenIndex", onboardingScreenIndex)
}

async function fetchEndpoints() {
    endpoints = await Endpoints.fetch();
}

_fetchCache()
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
    const qString = {phoneNumber, otp : Cache.getString("jwt")}
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
                'Authorization' : Cache.getString("jwt")
            },
        });

        console.log('File uploaded successfully: ', response.data);
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
}

/// invoke to get any cached data for the app
async function fetchAddFriendsOnboarding() {
    if (onboardingScreenIndex != 10) return;
    onboardingScreenIndex++;
    Cache.set("onboardingScreenIndex", onboardingScreenIndex);
    /// TODO: implement and cache
    const jwt = Cache.get("jwt");
    const url = endpoints["/onboarding/addfriends"];
    const response = await AxiosSigned.get(url, jwt);
    if (response.success)
    {
        Cache.set("addFriendsOnboarding", JSON.stringify(response.data))
        return response.data
    }
}

module.exports = {
    fetchCache,
    isOnboarding,
    submitPFP,
    fetchAddFriendsOnboarding,
    verifyStatus,
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
