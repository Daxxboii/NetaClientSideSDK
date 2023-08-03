import { SendAnalytics } from "./utils/User Based/Analytics";
import {
  inviteUser,
  OnPollReveal,
  OnPollRevealedPartial,
  ReadInbox,
  RegisterPolls,
  FetchPollsNow,
} from "./utils/User Based/AuthenticatedUserActions";
import {
  OnFriendRequest,
  AcceptFriendRequest,
  HideFriendRequestfriendPN,
  AddFriend,
  RemoveFriend,
  BlockFriend,
  ResetBlockList,
  ResetBlockList,
} from "./utils/User Based/FriendSystem";
import {
  login,
  logout,
  logoutAndDelete,
  addRealtimeListener,
  removeRealtimeListener,
} from "./utils/User Based/LoginLogout";
import { loginToCognito } from "./utils/User Based/LoginToCognito";
import {
  fetchCache,
  isOnboarding,
  submitPFP,
  fetchAddFriendsOnboarding,
  verifyStatus,
  submitAge,
  submitGrade,
  fetchSchools,
  submitSchool,
  fetchAllAddFriendsOnboardingPages,
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
} from "./utils/User Based/RegistrationFlow";

import { fetch } from "./utils/User Based/Refresh";


//now to export all these functions??