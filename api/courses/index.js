import { connectDB } from "../../config/db.js";
import Course from "../../models/Course.js";
import { authenticateUser } from "../../middleware/auth.js";

export default async function handler(req, res) {
  await connectDB();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await authenticateUser(req);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const allowedCourses = user.courses;
  if (!allowedCourses || allowedCourses.length === 0) {
    // User has no courses they can access
    return res.status(200).json([]);
  }

  const allowedCourseCodes = allowedCourses.map((course) => course.code);

  try {
    const courses = await Course.find({ code: { $in: allowedCourseCodes } }).lean();
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
