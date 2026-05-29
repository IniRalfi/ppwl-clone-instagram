import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, username: true, email: true }
  });

  const posts = await prisma.post.findMany({
    take: 5,
    select: { id: true, authorId: true }
  });

  console.log("Users:", users);
  console.log("Posts:", posts);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
