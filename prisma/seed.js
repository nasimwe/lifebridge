import prisma from "../src/config/database.js";
import bcrypt from "bcryptjs";

const main = async () => {
  // Create an Admin user
  const adminPassword = await bcrypt.hash("adminpassword", 10);
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@lifebridge.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
