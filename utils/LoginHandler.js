const Cache = require("./Cache.js");
const Endpoints = require("./Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("./AxiosSigned.js");

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
    const url = endpoints["/verifypn/sendotp"];
    const qstring = { phoneNumber };
    const response = await AxiosSigned.get(url, undefined, qstring);
    return response.data.success;
}

async function submitOTP(phoneNumber, otp) {
    const url = endpoints["/verifypn/verifyotp"];
    const qstring = { otp };
    const response = await AxiosSigned.get(url, Cache.get('jwt'), qstring);
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
    const response = await AxiosSigned.get(url, Cache.get('jwt'), qstring);
    const topicName = response.data.transactionId;
    Alby.SetupAlbyWithChannel(topicName, handleSubmitProfileResponseAlby);
}

async function checkSubmitProfile() {
    const url = endpoints["/submitProfile/fetchStatus"];
    const response = await AxiosSigned.get(url, Cache.get('jwt'));
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

async function login(username, password) {
    const url = endpoints["/login"];
    const qstring = { jwt: Cache.get('jwt') };
    const response = await AxiosSigned.get(url, qstring);
    Cache.set("albyChannelId", response.data.albyChannelId);
    Cache.set("albyDecryptionKey", response.data.albyDecryptionKey);
    Alby.SetupAlbyWithChannel(response.data.albyChannelId, handleAlbyData);
    return response.data.polls;
}

async function handleAlbyData(data) {
    data = crypto.decryptAES256(data, albyDecryptionKey)
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
