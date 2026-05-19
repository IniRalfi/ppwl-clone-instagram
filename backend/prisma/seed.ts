import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama...");
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Membuat banyak dummy users...");
  const usersData = [
    { email: "rflipratm@gmail.com", username: "rafli_pratama", name: "Rafli Pratama", bio: "Software Engineer", avatarUrl: "https://i.pravatar.cc/150?u=rafli" },
    { email: "adella@example.com", username: "adella_rs", name: "Adella Rheina", bio: "Frontend Developer", avatarUrl: "https://i.pravatar.cc/150?u=adella" },
    { email: "rifa@example.com", username: "rifa_db", name: "Rifa Dwinanda", bio: "Fullstack Developer", avatarUrl: "https://i.pravatar.cc/150?u=rifa" },
    { email: "budi@example.com", username: "budi_santoso", name: "Budi Santoso", bio: "Suka Ngoding & Kopi", avatarUrl: "https://i.pravatar.cc/150?u=budi" },
    { email: "citra@example.com", username: "citra_kirana", name: "Citra Kirana", bio: "UI/UX Designer", avatarUrl: "https://i.pravatar.cc/150?u=citra" },
    { email: "dimas@example.com", username: "dimas_tech", name: "Dimas Tech", bio: "Tech Enthusiast", avatarUrl: "https://i.pravatar.cc/150?u=dimas" },
    { email: "eka@example.com", username: "eka_travel", name: "Eka Traveler", bio: "Keliling Dunia 🌍", avatarUrl: "https://i.pravatar.cc/150?u=eka" },
    { email: "fajar@example.com", username: "fajar_foto", name: "Fajar Photography", bio: "Menangkap momen 📸", avatarUrl: "https://i.pravatar.cc/150?u=fajar" },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: { ...u, passwordHash: "dummyhash", provider: "email" },
    });
    createdUsers.push(user);
  }

  console.log("Membuat banyak dummy posts...");
  const postsData = [
    { content: "Pemandangan senja yang indah hari ini. 🌇", imageUrl: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[6].id },
    { content: "Coding terus sampai pagi! ☕💻", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[0].id },
    { content: "Akhirnya desain selesai juga. Gimana menurut kalian? 🎨", imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[4].id },
    { content: "Jalan-jalan di pegunungan, udara sangat segar! 🏔️", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[6].id },
    { content: "Hasil foto hunting sore tadi. Keren nggak? 📸", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[7].id },
    { content: "Setup meja kerja baru nih. Minimalis is the best!", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[1].id },
    { content: "Makan siang dengan menu sehat hari ini 🥗", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[3].id },
    { content: "Belajar teknologi baru memang menantang, tapi seru! 🔥", imageUrl: null, authorId: createdUsers[5].id },
    { content: "Lagi pusing debug error yang ga kelar-kelar 😭", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[2].id },
    { content: "Kucingku lucu banget pas lagi tidur nyenyak 😻", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80", authorId: createdUsers[1].id },
  ];

  const createdPosts = [];
  for (const p of postsData) {
    const post = await prisma.post.create({ data: p });
    createdPosts.push(post);
  }

  console.log("Membuat banyak likes dan comments...");
  // Berikan likes dan comments acak
  for (const post of createdPosts) {
    // 1-4 komen per post
    const commentCount = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < commentCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      await prisma.comment.create({
        data: {
          content: ["Keren banget! 🔥", "Wah mantap nih!", "Setuju banget bro", "Bagus banget fotonya", "Wah di mana ini?"][Math.floor(Math.random() * 5)],
          authorId: randomUser.id,
          postId: post.id,
        }
      });
    }

    // 2-6 like per post
    const likeCount = Math.floor(Math.random() * 5) + 2;
    const likedUsers = new Set();
    while(likedUsers.size < likeCount) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      if(!likedUsers.has(randomUser.id)) {
        likedUsers.add(randomUser.id);
        await prisma.like.create({
          data: { userId: randomUser.id, postId: post.id }
        });
      }
    }
  }

  console.log("✅ Seeding selesai dengan 8 Users, 10 Posts, serta puluhan Comment & Like!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
