const express = require("express");
const router = express.Router();
const User = require("../models/Users.scema");

// ----------------- CREATE ADMIN -----------------
router.post("/admin/create", async (req, res) => {
  try {
    const { name, email, clerkId } = req.body;

    // check if user exists
    let existing = await User.findOne({ clerkId });
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const admin = new User({
      name,
      email,
      clerkId,
      role: "admin", // always admin
      CoursesIds: []
    });

    await admin.save();

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- GET ALL ADMINS -----------------
router.get("/admin/all", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- GET SINGLE ADMIN -----------------
router.get("/admin/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin") return res.status(404).json({ success: false, message: "Admin not found" });
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- UPDATE ADMIN -----------------
router.put("/admin/:id", async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin") return res.status(404).json({ success: false, message: "Admin not found" });

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    await admin.save();

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- DELETE ADMIN -----------------
router.delete("/admin/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "admin") return res.status(404).json({ success: false, message: "Admin not found" });

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;