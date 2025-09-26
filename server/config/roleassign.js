import admin from "./firebase.js";

const setRole = async (uid, role) => {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`✅ Role '${role}' set for UID: ${uid}`);
};

setRole("5rBImt9KRPMRtdnATOcO7djT3uN2", "pharmacy"); // old account
