const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
const Alby = require("./Notifications/In-App/60Sec Workaround/Ably.js");
const AxiosSigned = require("../AxiosSigned.js");
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';

const crypto = require('crypto');

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
                invitee : phoneNumber,
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
exports.module = {inviteUser,
    OnPollRevealPartial,
    OnPollReveal,
    ReadInbox,
    RegisterPolls,
    FetchPollsNow
}