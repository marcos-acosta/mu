const KEYS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

export const MAX_LENGTH = KEYS.length;

export const getIthShortcut = (i: number) => {
  return KEYS.charAt(i);
};

export const getKeyIndex = (key: string) => {
  const keyIndex = KEYS.indexOf(key);
  if (keyIndex === -1) {
    return null;
  }
  return keyIndex;
};
