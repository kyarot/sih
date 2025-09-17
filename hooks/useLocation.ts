import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error(
          "Location services are disabled. Please enable them in your device settings."
        );
      }

      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error(
          "Location permission denied. Please enable location access in your device settings."
        );
      }

      setPermissionGranted(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      setPermissionGranted(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      // Ensure permission
      if (!permissionGranted) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;
      }

      // Get current position
      const { coords } = await Location.getCurrentPositionAsync({});
      const locationData: LocationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getLocationWithTimeout = async (timeout = 10000) => {
    return new Promise<LocationData | null>(async (resolve) => {
      const timeoutId = setTimeout(() => {
        setError("Location request timed out");
        resolve(null);
      }, timeout);

      try {
        const locationData = await getCurrentLocation();
        clearTimeout(timeoutId);
        resolve(locationData);
      } catch {
        clearTimeout(timeoutId);
        resolve(null);
      }
    });
  };

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionGranted(status === "granted");
      return status === "granted";
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  return {
    location, // always { latitude, longitude } or null
    error,
    loading,
    permissionGranted,
    requestLocationPermission,
    getCurrentLocation,
    getLocationWithTimeout,
    checkPermissionStatus,
  };
};
