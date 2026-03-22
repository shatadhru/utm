const express = require("express");
const router = express.Router();
const User = require("../models/Users.scema.js");
const Courses = require("../models/Courses.js");
const Subjects = require("../models/Subjects.js");

// ----------------- SIGNUP / LOGIN -----------------
router.post("/auth/signup", async (req, res) => {
  try {
    const { clerkId, email, name } = req.body; // frontend থেকে পাঠানো

    if (!clerkId) {
      return res.status(400).json({ success: false, message: "clerkId required" });
    }

    // check if user exists
    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({ clerkId, email: email || "", name: name || "Anonymous" });
      await user.save();
    }

    res.status(200).json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- GET CURRENT USER -----------------
router.post("/auth/me", async (req, res) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) return res.status(400).json({ success: false, message: "clerkId required" });

    const user = await User.findOne({ clerkId }).populate("CoursesIds");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== GET USER COURSES WITH SUBJECTS ==================
router.get("/user/:clerkId/courses", async (req, res) => {
  try {
    const { clerkId } = req.params;

    // 1️⃣ Find the user
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 2️⃣ Fetch courses assigned to user
    const courses = await Courses.find({ _id: { $in: user.CoursesIds } })
      .populate({
        path: "subjects",
        populate: { path: "lectures" } // যদি subject এর under e lectures থাকে
      });

    res.json({ success: true, courses });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;