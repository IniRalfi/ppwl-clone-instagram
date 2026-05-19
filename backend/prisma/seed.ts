import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama...");
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Membuat dummy user...");
  const user1 = await prisma.user.create({
    data: {
      email: "rflipratm@gmail.com",
      username: "rafli_pratama",
      name: "Rafli Pratama",
      passwordHash: "dummyhash",
      avatarUrl: "https://i.pravatar.cc/150?u=rafli",
      bio: "Software Engineer & Mahasiswa",
      provider: "email",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "adella@example.com",
      username: "adella_rs",
      name: "Adella Rheina",
      passwordHash: "dummyhash",
      avatarUrl: "https://i.pravatar.cc/150?u=adella",
      bio: "Frontend Developer",
      provider: "email",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "rifa@example.com",
      username: "rifa_db",
      name: "Rifa Dwinanda",
      passwordHash: "dummyhash",
      avatarUrl: "https://i.pravatar.cc/150?u=rifa",
      bio: "Fullstack Developer",
      provider: "email",
    },
  });

  console.log("Membuat dummy posts...");
  const post1 = await prisma.post.create({
    data: {
      content: "Halo dunia! Ini postingan pertama saya di aplikasi Clone Instagram PPWL. 🚀",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content:
        "Mengerjakan tugas Capstone bareng tim memang seru! Frontend beres, lanjut backend. 🔥",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      authorId: user2.id,
    },
  });

  console.log("Membuat dummy comments...");
  const comment1 = await prisma.comment.create({
    data: {
      content: "Wah keren banget capstone-nya! Semangat Rafli dkk!",
      authorId: user3.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: "Makasih Rifa! Gas terus sampai kelar 🎉",
      authorId: user1.id,
      postId: post1.id,
    },
  });

  console.log("Membuat dummy likes...");
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user3.id,
      postId: post2.id,
    },
  });

  console.log("Membuat dummy notifications...");
  await prisma.notification.create({
    data: {
      type: "like",
      message: "Adella Rheina menyukai postingan Anda.",
      receiverId: user1.id,
      refId: post1.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: "comment",
      message: "Rifa Dwinanda mengomentari postingan Anda: 'Wah keren banget capstone-nya...'",
      receiverId: user1.id,
      refId: post1.id,
    },
  });

  console.log("✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
