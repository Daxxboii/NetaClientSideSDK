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
} from "./utils/User Based/FriendSystem"; // Removed the duplicate ResetBlockList
import {
  login as loginUtil,
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
  login as loginRegistration,
  uploadEmojiContacts,
  uploadUserContacts,
} from "./utils/User Based/RegistrationFlow";
import { fetch } from "./utils/User Based/Refresh";

export {
  SendAnalytics,
  inviteUser,
  OnPollReveal,
  OnPollRevealedPartial,
  ReadInbox,
  RegisterPolls,
  FetchPollsNow,
  OnFriendRequest,
  AcceptFriendRequest,
  HideFriendRequestfriendPN,
  AddFriend,
  RemoveFriend,
  BlockFriend,
  ResetBlockList,
  loginUtil,
  logout,
  logoutAndDelete,
  addRealtimeListener,
  removeRealtimeListener,
  loginToCognito,
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
  loginRegistration,
  uploadEmojiContacts,
  uploadUserContacts,
  fetch,
};
