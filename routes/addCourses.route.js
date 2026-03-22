const express = require("express");
const router = express.Router();

const Courses = require("../models/Courses.js");
const Subjects = require("../models/Subjects");
const User = require("../models/Users.scema.js");

// ===================== CREATE COURSE =====================
router.post("/courses", async (req, res) => {
  try {
    const { title, description, instructor, price } = req.body;

    // 🔥 generate unique 3-digit random number
    let courseCode;
    let exists;
    do {
      courseCode = Math.floor(100 + Math.random() * 900);
      exists = await Courses.findOne({ courseCode });
    } while (exists);

    const newCourse = new Courses({
      title,
      description,
      instructor,
      price,
      courseCode,       // <-- add courseCode here
      subjects: []      // initially empty
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: savedCourse
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== GET ALL COURSES =====================
router.get("/courses", async (req, res) => {
  try {
    const courses = await Courses.find()
      .populate("subjects")
      .populate("instructor", "name email");

    res.status(200).json({ success: true, courses });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== GET SINGLE COURSE BY CODE =====================
router.get("/courses/code/:courseCode", async (req, res) => {
  try {
    const course = await Courses.findOne({ courseCode: Number(req.params.courseCode) })
      .populate("subjects")
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== UPDATE COURSE BY CODE =====================
router.put("/courses/code/:courseCode", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseCode: Number(req.params.courseCode) },
      req.body,
  { returnDocument: "after" } 
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== DELETE COURSE BY CODE =====================
router.delete("/courses/code/:courseCode", async (req, res) => {
  try {
    const deletedCourse = await Courses.findOneAndDelete({ courseCode: Number(req.params.courseCode) });

    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /courses/bulk-delete
router.post("/courses/bulk-delete", async (req, res) => {
  try {
    const { courseCodes } = req.body; 
    // example body: { "courseCodes": [521, 522, 530] }

    if (!courseCodes || !Array.isArray(courseCodes) || courseCodes.length === 0) {
      return res.status(400).json({ success: false, message: "courseCodes array required" });
    }

    const result = await Courses.deleteMany({ courseCode: { $in: courseCodes } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} courses deleted successfully`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== PUBLISH COURSE =====================
router.patch("/courses/code/:courseCode/publish", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseCode: Number(req.params.courseCode) },
      { isPublished: true },
      { new: true }
    );

    if (!updatedCourse) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Course published", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== UNPUBLISH COURSE =====================
router.patch("/courses/code/:courseCode/unpublish", async (req, res) => {
  try {
    const updatedCourse = await Courses.findOneAndUpdate(
      { courseCode: Number(req.params.courseCode) },
      { isPublished: false },
      { new: true }
    );

    if (!updatedCourse) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, message: "Course unpublished", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== GET COURSES BY CATEGORY =====================
router.get("/courses/by-category", async (req, res) => {
  try {
    const { categories } = req.query; // comma-separated string

    if (!categories) {
      return res.status(400).json({ success: false, message: "categories query required" });
    }

    const categoryArray = categories.split(",").map(cat => cat.trim());

    const courses = await Courses.find({ categories: { $in: categoryArray } }).populate("subjects");

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== BULK UPDATE COURSES =====================
router.put("/courses/bulk-update", async (req, res) => {
  try {
    const { courseCodes, updateData } = req.body; 
    // example body: { "courseCodes": [521,522], "updateData": { "status":"Ongoing", "price":599 } }

    if (!courseCodes || !Array.isArray(courseCodes) || courseCodes.length === 0) {
      return res.status(400).json({ success: false, message: "courseCodes array required" });
    }

    if (!updateData || typeof updateData !== "object") {
      return res.status(400).json({ success: false, message: "updateData object required" });
    }

    const result = await Courses.updateMany(
      { courseCode: { $in: courseCodes } },
      { $set: updateData }
    );

    res.status(200).json({ success: true, message: `${result.modifiedCount} courses updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== BULK UPDATE COURSES INDIVIDUALLY =====================
router.put("/courses/bulk-update-individual", async (req, res) => {
  try {
    const { updates } = req.body;
    /*
      Example body:
      {
        "updates": [
          { "courseCode": 521, "updateData": { "status": "Ongoing", "price": 599 } },
          { "courseCode": 522, "updateData": { "status": "Completed", "price": 699 } },
          { "courseCode": 530, "updateData": { "visibility": "private" } }
        ]
      }
    */

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "updates array required" });
    }

    const results = [];

    for (const item of updates) {
      const { courseCode, updateData } = item;

      if (!courseCode || !updateData) continue; // skip invalid entries

      const updatedCourse = await Courses.findOneAndUpdate(
        { courseCode: Number(courseCode) },
        updateData,
        { returnDocument: "after" } // Mongoose 7+ compatible
      );

      if (updatedCourse) results.push(updatedCourse);
    }

    res.status(200).json({
      success: true,
      message: `${results.length} courses updated successfully`,
      courses: results
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;