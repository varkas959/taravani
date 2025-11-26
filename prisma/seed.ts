import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: "admin@taravani.com" },
    update: {},
    create: {
      email: "admin@taravani.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Default password: admin123");
  console.log("Please change this password after first login!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

