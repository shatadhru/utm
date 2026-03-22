const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({

  courseCode: {
    type: Number,
    unique: true,
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },



  price: { type: Number, default: 0 },
  regularPrice: { type: Number, default: 0 },
  image: { type: String, default: "" },
  introVideo: { type: String },
  categories: [{ type: String }],

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"  // subjects আলাদা collection
    }
  ],
    instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // User collection
    required: true
  },

  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed"],
    default: "Upcoming"
  },

  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },

  isPublished: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);