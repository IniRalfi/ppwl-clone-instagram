import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Membersihkan data lama ===");
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.story.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("=== Membuat Users ===");
  const usersData = [
    { email: "rflipratm@gmail.com", username: "rafli_pratama", name: "Rafli Pratama", bio: "Software Engineer & Tech Lead", role: "ADMIN" as const },
    { email: "h1101241034@student.untan.ac.id", username: "adella_n", name: "Adella Rheina Sweeta", bio: "Frontend Enthusiast", role: "USER" as const },
    { email: "h1101241023@student.untan.ac.id", username: "bagas_r", name: "Rifa Dwinanda Bagaskara", bio: "Fullstack wannabe", role: "USER" as const },
    { email: "h1101241032@student.untan.ac.id", username: "yasmin_ta", name: "Tan Atira Yasmin", bio: "UI/UX Designer", role: "USER" as const },
    { email: "h1101241019@student.untan.ac.id", username: "olivia_n", name: "Olivia Naura Fakhradika", bio: "Creative Designer", role: "USER" as const },
    { email: "h1101241026@student.untan.ac.id", username: "salsabila_h", name: "Salsabila Nur Haniyah", bio: "Mobile UI Specialist", role: "USER" as const },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        name: u.name,
        bio: u.bio,
        passwordHash: "$2b$10$dummyhashdummyhashdummyhashdummyhashdummyha",
        provider: "email",
        role: u.role,
      },
    });
    createdUsers.push(user);
  }
  console.log(`  ✅ ${createdUsers.length} users dibuat`);

  const [rafli, adella, bagas, yasmin, olivia, salsabila] = createdUsers;

  console.log("=== Membuat Follow ===");
  const follows = [
    [adella, rafli], [bagas, rafli], [yasmin, rafli], [olivia, rafli], [salsabila, rafli],
    [rafli, adella], [rafli, bagas], [rafli, yasmin], [rafli, olivia], [rafli, salsabila],
    [adella, yasmin], [adella, olivia],
    [bagas, adella], [bagas, yasmin],
    [yasmin, adella], [yasmin, olivia],
    [olivia, adella], [olivia, salsabila],
  ];
  for (const [follower, following] of follows) {
    await prisma.follow.create({ data: { followerId: follower.id, followingId: following.id } });
  }
  console.log(`  ✅ ${follows.length} follow dibuat`);

  console.log("\n==============================================");
  console.log("🎉 Seeding selesai!");
  console.log(`  ${createdUsers.length} Users`);
  console.log(`  ${follows.length} Follows`);
  console.log("\n📝 Catatan: Postingan, komen, like diisi manual ya!");
  console.log("==============================================");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
