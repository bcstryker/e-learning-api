const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sectionId: { type: String, required: true, ref: "Section" },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: [String], required: true },
  explanation: { type: String },
});

module.exports = mongoose.model("Question", QuestionSchema);