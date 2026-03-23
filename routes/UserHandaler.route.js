const express = require("express");
const router = express.Router();
const User = require("../models/Users.scema.js");
const Courses = require("../models/Courses.js");

// 🔐 helper function (middleware না, just function)
const getUserId = (req) => {
  return req.headers["x-user-id"]; // frontend থেকে পাঠাবি
};

// ----------------- SIGNUP -----------------
router.post("/auth/signup", async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId) {
      return res.status(400).json({ success: false, message: "clerkId required" });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({
        clerkId,
        email,
        name,
        CoursesIds: []
      });
      await user.save();
    }

    res.status(200).json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- GET CURRENT USER -----------------
router.get("/auth/me", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId })
      .populate("CoursesIds");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================== GET MY COURSES ==================
router.get("/my/courses", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const courses = await Courses.find({
      _id: { $in: user.CoursesIds }
    }).populate({
      path: "subjects",
      select: "name lectures",
      populate: {
        path: "lectures",
        select: "title videoUrl"
      }
    });

    res.json({ success: true, courses });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================== ENROLL COURSE ==================
router.post("/course/enroll", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { courseId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // already enrolled check
    if (user.CoursesIds.includes(courseId)) {
      return res.json({ success: true, message: "Already enrolled" });
    }

    user.CoursesIds.push(courseId);
    await user.save();

    res.json({ success: true, message: "Course enrolled" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/user/full-data", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]; // temporary

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ success: false });
    }

    const courses = await Courses.find({
      _id: { $in: user.CoursesIds }
    }).populate({
      path: "subjects",
      select: "title lectures"
    });

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      },
      courses
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;