const express = require("express");
const router = express.Router();
const Subject = require("../models/Subjects.js");

// ----------------- CREATE SUBJECT -----------------
router.post("/subject/create", async (req, res) => {
  try {
    const { title, description } = req.body;

    const subject = new Subject({
      title,
      description,
      lectures: []
    });

    await subject.save();

    res.json({ success: true, subject });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- GET ALL SUBJECTS -----------------
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find();

    res.json({ success: true, subjects });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- GET SINGLE SUBJECT -----------------
router.get("/subject/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    res.json({ success: true, subject });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- UPDATE SUBJECT -----------------
router.put("/subject/:id", async (req, res) => {
  try {
    const { title, description } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    res.json({ success: true, subject });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- DELETE SUBJECT -----------------
router.delete("/subject/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Subject deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =====================================================
// 🎥 LECTURE MANAGEMENT (inside subject)
// =====================================================


// ----------------- ADD LECTURE -----------------
router.post("/subject/:id/lecture", async (req, res) => {
  try {
    const { title, videoUrl, duration, order } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    subject.lectures.push({ title, videoUrl, duration, order });

    await subject.save();

    res.json({ success: true, subject });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- UPDATE LECTURE -----------------
router.put("/subject/:subjectId/lecture/:lectureId", async (req, res) => {
  try {
    const { subjectId, lectureId } = req.params;
    const { title, videoUrl, duration, order } = req.body;

    const subject = await Subject.findById(subjectId);

    const lecture = subject.lectures.id(lectureId);

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    lecture.title = title || lecture.title;
    lecture.videoUrl = videoUrl || lecture.videoUrl;
    lecture.duration = duration || lecture.duration;
    lecture.order = order || lecture.order;

    await subject.save();

    res.json({ success: true, subject });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------------- DELETE LECTURE -----------------
router.delete("/subject/:subjectId/lecture/:lectureId", async (req, res) => {
  try {
    const { subjectId, lectureId } = req.params;

    const subject = await Subject.findById(subjectId);

    subject.lectures = subject.lectures.filter(
      lec => lec._id.toString() !== lectureId
    );

    await subject.save();

    res.json({ success: true, message: "Lecture deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/subject/:id/lectures/bulk", async (req, res) => {
  try {
    const { id } = req.params;
    const { lectures } = req.body;

    if (!Array.isArray(lectures) || lectures.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lectures array required"
      });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    // 🔥 validate each lecture
    const formattedLectures = lectures.map((lec, index) => ({
      title: lec.title || `Lecture ${index + 1}`,
      videoUrl: lec.videoUrl,
      duration: lec.duration || 0,
      order: lec.order ?? subject.lectures.length + index
    }));

    // 🚀 push all at once
    subject.lectures.push(...formattedLectures);

    await subject.save();

    res.json({
      success: true,
      message: "Bulk lectures added",
      totalAdded: formattedLectures.length,
      subject
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;