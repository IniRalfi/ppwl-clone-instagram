import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Password123!", 10);
  
  // Find or create test user
  const email = "testfinal123@gmail.com";
  const username = "testfinal123";
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash
    },
    create: {
      email,
      username,
      name: "Test Final",
      passwordHash: hash
    }
  });

  console.log("Updated/created test user:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
