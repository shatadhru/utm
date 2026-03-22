const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: Number,
  order: { type: Number, default: 0 }
}, { _id: true });

const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lectures: [LectureSchema], // Add multiple lectures here
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subject", SubjectSchema);