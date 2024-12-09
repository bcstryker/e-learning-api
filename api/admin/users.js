import bcrypt from "bcryptjs";
import {connectAdminDB} from "../../config/db";
import User from "../../models/User";
import Course from "../../models/Course";
import crypto from "crypto";

connectAdminDB();

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return createUsers(req, res);
    case "PUT":
      return updateUser(req, res);
    case "GET":
      return getUsers(req, res);
    case "DELETE":
      return deleteUser(req, res);
    default:
      return res.status(405).json({error: "Method not allowed"});
  }
}

// Function to create users
async function createUsers(req, res) {
  console.log("Creating users...");
  const {emails, courses} = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({error: "Invalid or missing email addresses"});
  }
  if (!courses || !Array.isArray(courses)) {
    return res.status(400).json({error: "Invalid or missing courses"});
  }

  try {
    // Fetch ObjectIds for the provided course names
    const courseIds = await Course.find({code: {$in: courses}}).select("_id");
    const courseObjectIds = courseIds.map((course) => course._id);

    const newUsers = [];

    for (const email of emails) {
      const existingUser = await User.findOne({email});
      if (existingUser) continue; // Skip if the user already exists

      const plainPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const courseDetails = await Course.find({code: {$in: courses}}).select("_id code").lean();
      const courseObjects = courseDetails.map((course) => {
        console.log(course);
        return {
          courseId: course._id,
          code: course.code,
        }
      });
      console.log(courseObjects);
      const newUser = new User({
        name: email.split("@")[0],
        email,
        password: hashedPassword,
        role: "student",
        courses: courseObjects,
      });

      await newUser.save();
      newUsers.push({email, plainPassword});
    }

    return res.status(201).json({message: "Users created successfully", users: newUsers});
  } catch (error) {
    console.error("Error creating users:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}

// Function to update a user
async function updateUser(req, res) {
  const {email, name, newEmail, role, courses, password} = req.body;

  if (!email) {
    return res.status(400).json({error: "Email of the user to update is required"});
  }

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    if (name) user.name = name;
    if (newEmail) user.email = newEmail;
    if (role) user.role = role;
    if (Array.isArray(courses)) user.courses = courses;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return res.status(200).json({message: "User updated successfully", user});
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}

// Function to get users (single or multiple)
async function getUsers(req, res) {
  const {email} = req.query;

  try {
    if (email) {
      // Get one user by email
      const user = await User.findOne({email});
      if (!user) {
        return res.status(404).json({error: "User not found"});
      }
      return res.status(200).json({user});
    } else {
      // Get all users
      const users = await User.find({});
      return res.status(200).json({users});
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}

// Function to delete a user
async function deleteUser(req, res) {
  const {email} = req.body;

  if (!email) {
    return res.status(400).json({error: "Email is required to delete a user"});
  }

  try {
    const deletedUser = await User.findOneAndDelete({email});
    if (!deletedUser) {
      return res.status(404).json({error: "User not found"});
    }

    return res.status(200).json({message: "User deleted successfully", user: deletedUser});
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}

// Utility function to generate a random password
function generateRandomPassword() {
  return crypto.randomBytes(8).toString("hex");
}
