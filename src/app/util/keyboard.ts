export const getIthShortcut = (i: number) => {
  return "abcdefghijklmnopqrstuvwxyz0123456789".charAt(i);
};

export const getKeyIndex = (key: string) => {
  const keyIndex = "abcdefghijklmnopqrstuvwxyz0123456789".indexOf(key);
  if (keyIndex === -1) {
    return null;
  }
  return keyIndex;
};
