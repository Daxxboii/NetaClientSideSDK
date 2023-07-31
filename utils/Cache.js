import { MMKV } from 'react-native-mmkv'

export const Cache = new MMKV({
  id: `user-${userId}-storage`,
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'hunter2'
})

exports.module = storage

/// storage.getString("")
/// storage.set("key", val)