import { Router } from "express";
import prisma from "../config/database.js";
import authenticateToken from "../middlewares/authMiddleware.js";

// Get All Communities
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: {
        admin: {
          select: { id: true, name: true }, // Include admin details
        },
        users: {
          select: { id: true, name: true }, // Include community members
        },
      },
    });

    res.json({ message: "Communities fetched successfully.", communities });
  } catch (error) {
    console.error("Get Communities Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Community Posts
export const getCommunityPosts = async (req, res) => {
  const { communityId } = req.params;

  try {
    const posts = await prisma.communityPost.findMany({
      where: { communityId: parseInt(communityId, 10) },
      include: {
        author: {
          select: { id: true, name: true }, // Include author details
        },
      },
    });

    res.json({ message: "Posts fetched successfully.", posts });
  } catch (error) {
    console.error("Get Community Posts Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Leave Community
export const leaveCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    // Remove the user from the community
    await prisma.community.update({
      where: { id: communityId },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });

    res.json({ message: "Successfully left the community." });
  } catch (error) {
    console.error("Leave Community Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Join Community
export const joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    // Check if the user is already a member
    const membership = await prisma.community.findFirst({
      where: {
        id: communityId,
        users: { some: { id: userId } },
      },
    });

    if (membership) {
      return res.status(400).json({ error: "User is already a member." });
    }

    // Add the user to the community
    await prisma.community.update({
      where: { id: communityId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });

    res.json({ message: "Successfully joined the community." });
  } catch (error) {
    console.error("Join Community Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
