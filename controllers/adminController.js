import prisma from "../config/database.js";

// Add Opportunity
export const addOpportunity = async (req, res) => {
  const { title, description } = req.body;
  const adminId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    const opportunity = await prisma.opportunity.create({
      data: { title, description, adminId },
    });

    res
      .status(201)
      .json({ message: "Opportunity created successfully.", opportunity });
  } catch (error) {
    console.error("Add Opportunity Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
export const getAllBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await prisma.user.findMany({
      where: { role: "USER" },
      include: {
        profileInfo: true, // Optionally include profile details
        sponsor: true, // Optionally include sponsorship info
      },
    });

    res.json({ message: "Beneficiaries fetched successfully.", beneficiaries });
  } catch (error) {
    console.error("Get Beneficiaries Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// save sponsor in sposor table
// model Sponsor {
//   id                   Int      @id @default(autoincrement())
//   name                 String
//   email                String   @unique
//   maxSupportAmount     Int
//   currentSupportAmount Int      @default(0)
//   maxBeneficiaries     Int
//   currentBeneficiaries Int      @default(0)
//   createdAt            DateTime @default(now())

//   beneficiaries User[] @relation("SponsorBeneficiaries") // One-to-Many relation
//   User          User[]
// }

export const saveSponsor = async (req, res) => {
  const {
    name,
    email,
    maxSupportAmount,
    maxBeneficiaries,
    currentSupportAmount,
  } = req.body;
  const adminId = req.user.id; // Assuming `req.user` is populated by middleware

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    if (user.role === "SPONSOR") {
      await prisma.user.update({
        where: { email },
        data: { applicationStatus: "APPROVED" },
      });
    }
  }

  let sponsor = await prisma.sponsor.findUnique({
    where: { email },
  });

  if (!sponsor) {
    try {
      const sponsor = await prisma.sponsor.create({
        data: {
          name,
          email,
          maxSupportAmount,
          currentSupportAmount,
          maxBeneficiaries,
          userId: user.id,
        },
      });

      res
        .status(201)
        .json({ message: "Sponsor created successfully.", sponsor });
    } catch (error) {
      console.error("Add Sponsor Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getallSponosorsFromUsersTable = async (req, res) => {
  try {
    const sponsors = await prisma.user.findMany({
      where: { role: "SPONSOR" },
      include: {
        profileInfo: true, // Optionally include profile details
        sponsor: true, // Optionally include sponsorship info
      },
    });

    res.json({ message: "Sponsors fetched successfully.", sponsors });
  } catch (error) {
    console.error("Get Sponsors Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getallSponosors = async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        // user: true, // Include sponsor details
        beneficiaries: true, // Include sponsored beneficiaries
      },
    });

    const users = await prisma.user.findMany({
      where: { role: "SPONSOR" },
      include: {
        profileInfo: true, // Optionally include profile details
        sponsor: true, // Optionally include sponsorship info
      },
    });

    res.json({
      message: "Sponsors fetched successfully.",
      sponsors: sponsors,
      users: users,
    });
  } catch (error) {
    console.error("Get Sponsors Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllOpportunities = async (req, res) => {
  const adminId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { adminId },
    });

    res.json({ message: "Opportunities fetched successfully.", opportunities });
  } catch (error) {
    console.error("Get Opportunities Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Add Community
export const addCommunity = async (req, res) => {
  const { title, description } = req.body;
  const adminId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    const community = await prisma.community.create({
      data: {
        title,
        description,
        adminId,
      },
    });

    res
      .status(201)
      .json({ message: "Community created successfully.", community });
  } catch (error) {
    console.error("Add Community Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete Community Post
export const deleteCommunityPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Assuming `req.user` is populated by middleware

  try {
    // Verify post ownership
    const post = await prisma.communityPost.findUnique({
      where: { id: parseInt(postId, 10) },
    });

    if (!post || post.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post." });
    }

    await prisma.communityPost.delete({ where: { id: parseInt(postId, 10) } });

    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete Community Post Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateBeneficiaryStatus = async (req, res) => {
  const { userId, status, sponsorId } = req.body;

  console.log("request body", req.body);

  try {
    const validStatuses = ["APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Valid statuses are: ${validStatuses.join(
          ", "
        )}.`,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== "USER") {
      return res.status(400).json({
        error: "Only users with the 'USER' role can have their status updated.",
      });
    }

    if (status === "APPROVED" && !sponsorId) {
      return res.status(400).json({
        error: "A sponsor must be assigned when approving a beneficiary.",
      });
    }

    if (status === "APPROVED") {
      const sponsor = await prisma.sponsor.findUnique({
        where: { id: sponsorId },
      });

      if (!sponsor) {
        return res.status(404).json({ error: "Sponsor not found." });
      }

      if (sponsor.currentBeneficiaries >= sponsor.maxBeneficiaries) {
        return res.status(400).json({
          error: "Sponsor has reached the maximum number of beneficiaries.",
        });
      }

      // Use transaction for sponsor assignment and user update
      const [updatedSponsor, updatedUser] = await prisma.$transaction([
        prisma.sponsor.update({
          where: { id: sponsorId },
          data: { currentBeneficiaries: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { sponsorId, applicationStatus: status },
        }),
      ]);

      return res.json({
        message: `Application status updated to '${status}' successfully.`,
        updatedUser,
        updatedSponsor,
      });
    } else {
      // Update only the application status for non-approved statuses
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { applicationStatus: status },
      });

      return res.json({
        message: `Application status updated to '${status}' successfully.`,
        updatedUser,
      });
    }
  } catch (error) {
    console.error("Update Beneficiary Status Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
