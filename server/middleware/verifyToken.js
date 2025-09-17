import admin from "../config/firebase.js";

// Expects: Authorization: Bearer <idToken>
export default async function verifyToken(req, res, next) {
  try {
     if (process.env.NODE_ENV === "development") {
    req.user = { id: "68c7e45c7e560baf62e8d973", role: "pharmacy" };
    console.log("Bypass mode: attached req.user =", req.user);
    return next();
  }
   /* const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ success: false, error: "No token provided" });

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 👇 Standardize everything into req.user
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role || "pharmacy", // fallback role if you want
    };
    req.uid = decoded.uid; // still keep old style if needed
    req.decoded = decoded; */

    next();
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
}