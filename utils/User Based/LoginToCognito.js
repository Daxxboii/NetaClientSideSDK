const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Cache = require('../Cache.js');
const KV = require('../KV.js');

let userPoolId, clientId;
async function fetch() {
    var {_userPoolId, _clientId} = await KV.fetch(["UserPoolId", ["ClientId"]])
    userPoolId = _userPoolId;
    clientId = _clientId;
}
fetch()

async function loginToCognito() {
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

        onFailure: function(err) {
            console.error(`Error in login: ${err}`);
        }
    });
}

module.exports = loginToCognito;
