import { nanoid } from 'nanoid';

const DEVICE_ID_KEY = 'cardfolio_device_id';

/**
 * Gets the device ID from localStorage or creates a new one if it doesn't exist
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = nanoid();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}
