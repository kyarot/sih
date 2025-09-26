import admin from "../config/firebase.js";
import Pharmacy from "../models/Pharmacy.js";
// Expects: Authorization: Bearer <idToken>
export default async function verifyToken(req, res, next) {
  try {
  //    if (process.env.NODE_ENV === "development") {
  //   req.user = { id: "68c82f7f166b4be91b622fac", role: "pharmacy" };
  //   console.log("Bypass mode: attached req.user =", req.user);
  //   return next();
  // }
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ success: false, error: "No token provided" });

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 👇 Standardize everything into req.user
    console.log("decoded", decoded);

     // Fetch the pharmacy if this is a pharmacy account
    let pharmacy = null;
    if (decoded.role === "pharmacy" || !decoded.role) {
      pharmacy = await Pharmacy.findOne({ uid: decoded.uid });
    }

    req.user = {
      id: pharmacy ? pharmacy._id : decoded.uid,
      email: decoded.email,
      role: decoded.role || "pharmacy", // fallback role if you want
    };
    console.log("the id: ",req.user.id)
    req.uid = decoded.uid; // still keep old style if needed
    req.decoded = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
}