import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const SecureStorage = {
  set: async ({ key, value }) => {
    try {
      await SecureStoragePlugin.set({ key, value });
    } catch (error) {
      console.warn('SecureStoragePlugin.set failed, falling back to localStorage:', error);
      localStorage.setItem(key, value);
    }
  },

  get: async ({ key }) => {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch (error) {
      // If the key does not exist or platform is web without plugin support, fallback
      const localValue = localStorage.getItem(key);
      if (localValue !== null) {
        return localValue;
      }
      return null;
    }
  },

  remove: async ({ key }) => {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      console.warn('SecureStoragePlugin.remove failed, falling back to localStorage:', error);
      localStorage.removeItem(key);
    }
  },

  clear: async () => {
    try {
      await SecureStoragePlugin.clear();
    } catch (error) {
      console.warn('SecureStoragePlugin.clear failed, falling back to localStorage:', error);
      localStorage.clear();
    }
  }
};
