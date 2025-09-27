import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * Create a new notification
 * Body: { userId, message, type? }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if (!userId || !message) return res.status(400).json({ error: "Missing fields (userId, message)" });

    const newNotification = await Notification.create({ userId, message, type });
    res.status(201).json(newNotification);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all notifications for a user (patient)
 * GET /api/notifications/patient/:userId
 */
router.get("/patient/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

/**
 * Mark single notification read
 * PUT /api/notifications/:id/read
 */
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Error marking read:", err);
    res.status(500).json({ message: "Failed to mark read" });
  }
});

/**
 * Mark all notifications for a user as read
 * PUT /api/notifications/patient/:userId/read-all
 */
router.put("/patient/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking all read:", err);
    res.status(500).json({ message: "Failed to mark all read" });
  }
});

export default router;
