import * as SecureStore from 'expo-secure-store';

const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };
let pending: Promise<void> = Promise.resolve();

function enqueue(operation: () => Promise<void>) {
  const result = pending.then(operation);
  pending = result.catch(() => {});
  return result;
}

export const secureGet = (key: string) => SecureStore.getItemAsync(key, options);
export const secureSet = (key: string, value: string) =>
  enqueue(() => SecureStore.setItemAsync(key, value, options));
export const secureDelete = (key: string) =>
  enqueue(() => SecureStore.deleteItemAsync(key, options));
