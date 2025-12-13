import { v4 as uuidv4 } from 'uuid';

const DEVICE_TOKEN_KEY = 'admin_device_token';

export const getDeviceToken = (): string => {
  let deviceToken = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!deviceToken) {
    deviceToken = uuidv4();
    localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
  }
  return deviceToken;
};

export const clearDeviceToken = (): void => {
  localStorage.removeItem(DEVICE_TOKEN_KEY);
};

