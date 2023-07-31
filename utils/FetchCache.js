const Cache = require('./Cache')

/// invoked to fetch the schools cache or undefined
function fetchSchoolsCache() {
    return JSON.parse(Cache.getString("schools"))
  }
  
  function fetchOnboardingAddFriendsCache()
  {
    return JSON.parse(Cache.getString("addFriendsOnboarding"))
  }
  
  async function fetchCache() {
    const isOnboarding = Cache.getBoolean("isOnboarding");
    const onboardingScreenIndex = Cache.getInt("onboardingScreenIndex");
    const jwt = Cache.getString("jwt");
    const phoneNumber = Cache.getString("phoneNumber");
    const otp = Cache.getString("otp");
    const firstName = Cache.getString("firstName");
    const lastName = Cache.getString("lastName");
    const schools = fetchSchoolsCache();
    const addFriendsOnboarding = fetchOnboardingAddFriendsCache();
    const age = Cache.getInt("age");
    const grade = Cache.getInt("grade");
    const highschool = Cache.getString("highschool");
    const gender = Cache.getString("gender");
    const school = Cache.getString("school");
    const username = Cache.getString("username");
    const albyChannelId = Cache.getString("albyChannelId");
    const albyDecryptionKey = Cache.getString("albyDecryptionKey");
    const loginFuncCache = JSON.parse(Cache.getString("loginFuncCache"));
    const requestPolls = Cache.get("requestPolls");
  
    return {
        isOnboarding,
        onboardingScreenIndex,
        jwt,
        phoneNumber,
        otp,
        firstName,
        lastName,
        schools,
        addFriendsOnboarding,
        age,
        grade,
        highschool,
        gender,
        school,
        username,
        albyChannelId,
        albyDecryptionKey,
        loginFuncCache,
        requestPolls
    };
  }

  exports = fetchCache;