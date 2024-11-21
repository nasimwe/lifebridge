import prisma from "../config/database.js";

// Submit Application to Join Community
export const applyToJoin = async (req, res) => {
  const { details } = req.body;
  const userId = req.user.id; // From JWT

  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { userId },
      data: { details, status: "PENDING" },
    });

    res.json({ message: "Application submitted successfully.", beneficiary });
  } catch (error) {
    console.error("Apply to Join Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Provide Progress Updates to Sponsor
export const updateProgress = async (req, res) => {
  const { progress } = req.body;
  const userId = req.user.id; // From JWT

  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { userId },
      data: { progress },
    });

    res.json({ message: "Progress updated successfully.", beneficiary });
  } catch (error) {
    console.error("Update Progress Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Assign Beneficiary to Sponsor
export const assignBeneficiary = async (req, res) => {
  const { beneficiaryId } = req.body;
  const sponsorId = req.user.id; // From JWT

  try {
    // Find sponsor profile
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId: sponsorId },
      include: { beneficiaries: true },
    });

    if (!sponsor) {
      return res.status(404).json({ error: "Sponsor profile not found." });
    }

    // Assign beneficiary
    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: { sponsorId: sponsor.id },
    });

    res.json({
      message: "Beneficiary assigned successfully.",
      beneficiary: updatedBeneficiary,
    });
  } catch (error) {
    console.error("Assign Beneficiary Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
