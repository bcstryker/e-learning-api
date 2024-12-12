// pages/api/courses.js
import jwt from "jsonwebtoken";
import {connectDB} from "../config/db.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({error: "Method not allowed"});
  }

  // Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({error: "Unauthorized"});
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({error: "Invalid or expired token"});
  }
  // get email from decoded token
  const {email} = decoded;
  // get user with email
  const user = await User.findOne({email});

  const allowedCourses = user.courses;
  if (allowedCourses.length === 0) {
    // User has no courses they can access
    return res.status(200).json([]);
  }
  const allowedCourseIds = allowedCourses.map((course) => course.code);
  try {
    const courses = await Course.find({code: {$in: allowedCourseIds}}).lean();
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
