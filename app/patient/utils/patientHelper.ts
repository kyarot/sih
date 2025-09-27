import * as Location from "expo-location";

export async function updatePatientLocation(uid: string, apiUrl: string="https://7300c4c894de.ngrok-free.app/api") {
  try {
    // Ask for permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { success: false, message: "Location permission not granted" };
    }

    // Get location
    let loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    // console.log("coords:", coords);

    // Send to backend
    const res = await fetch(`${apiUrl}/patients/update-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        coordinates: [coords.longitude, coords.latitude],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save location");

    return { success: true, message: "Location saved successfully", coords };
  } catch (err: any) {
    return { success: false, message: err.message || "Error saving location" };
  }
}
