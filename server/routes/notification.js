const router = require("express").Router();
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/auth");

router.param("id", (req, res, next, id) =>
    mongoose.isValidObjectId(id) ? next() : res.status(404).json({ message: "Notification not found!" })
);

router.get("/", verifyToken, async (req, res) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50),
            Notification.countDocuments({ userId: req.user.id, read: false }),
        ]);
        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

router.get("/unread-count", verifyToken, async (req, res) => {
    try {
        res.json({ unreadCount: await Notification.countDocuments({ userId: req.user.id, read: false }) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

router.patch("/read-all", verifyToken, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.json({ message: "All notifications marked as read." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update notifications." });
    }
});

router.delete("/", verifyToken, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });
        res.json({ message: "Notifications cleared." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to clear notifications." });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Notification not found!" });
        res.json({ message: "Notification deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete the notification." });
    }
});

module.exports = router;
