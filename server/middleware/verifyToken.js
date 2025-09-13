import admin from "../config/firebase.js";

// Expects: Authorization: Bearer <idToken>
export default async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ success: false, error: "No token provided" });

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    req.uid = decoded.uid;    // attach UID
    req.decoded = decoded;    // full token info (optional)
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
}
