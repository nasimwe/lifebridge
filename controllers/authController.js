import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js"; // Prisma client instance

// Helper Function to Generate JWT
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// User Registration (Signup)
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate role
    const validRoles = ["USER", "SPONSOR"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Choose one of: ${validRoles.join(", ")}`,
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // Create role-specific related profiles
    if (role === "USER") {
      await prisma.beneficiary.create({
        data: { userId: user.id, details: "" },
      });
    } else if (role === "SPONSOR") {
      await prisma.sponsor.create({ data: { userId: user.id, maxSupport: 5 } }); // Example field
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: "User created successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// User Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
