// frontend/src/pages/HomePage.tsx

import React from 'react';
import { PostCard } from '../components/post/PostCard'; 

const DUMMY_POSTS = [
  {
    id: '1',
    username: 'adella_codes',
    avatarUrl: '', 
    imageUrls: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', 
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', 
    ],
    caption: 'Akhirnya berhasil install komponen Avatar dari ShadcnUI! Hari yang panjang tapi seru banget! 🚀💻',
    likesCount: 1240,
    timeAgo: '2 jam',
    // 🌟 DATA STATISTIK UNTUK HOVER CARD ADELLA
    postsCount: '42',
    followers: '1,240',
    following: '348',
    bio: 'Frontend Developer | React & Tailwind'
  },
  {
    id: '2',
    username: 'rafli_tech',
    avatarUrl: '', 
    imageUrls: [
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80' 
    ],
    caption: 'Lagi review kodingan tim frontend. Gila, rapi bener kodingannya Adella. Lanjut gas TAHAP 3! 🔥',
    likesCount: 890,
    timeAgo: '5 jam',
    // 🌟 DATA STATISTIK UNTUK HOVER CARD RAFLI
    postsCount: '156',
    followers: '3,892',
    following: '512',
    bio: 'Backend Engineer | Node.js & Go'
  },
  {
    id: '3',
    username: 'uptbahasa_untan',
    avatarUrl: '', 
    imageUrls: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' 
    ],
    caption: 'Selamat kepada para Mahasiswa Berprestasi Pilmapres 2026. Sukses selalu di kancah nasional! 🎓✨',
    likesCount: 136,
    timeAgo: '1w',
    postsCount: '1,008',
    followers: '2,967',
    following: '79',
    bio: 'UPA Bahasa Universitas Tanjungpura',
    // 🌟 DATA COORDINAT TAG AKUN ORANG (Suaikan x dan y nya biar pas di atas kepala foto)
    tags: [
      { username: 'ozmar_zaidan', x: 35, y: 45 },
      { username: 'naufal_issan', x: 65, y: 45 },
      { username: 'elpan_pinoo', x: 35, y: 75 },
      { username: 'adnadinna_nr', x: 65, y: 75 }
    ]
  }
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ig-background text-zinc-100 pt-6 pb-20 flex flex-col items-center">
      <div className="w-full max-w-[550px] flex flex-col gap-5 px-3 sm:px-0">
        
        {DUMMY_POSTS.map((post) => (
          <PostCard
            key={post.id}
            username={post.username}
            avatarUrl={post.avatarUrl}
            imageUrls={post.imageUrls} 
            caption={post.caption}
            likesCount={post.likesCount}
            timeAgo={post.timeAgo}
            postsCount={post.postsCount}
            followers={post.followers}
            following={post.following}
            bio={post.bio}
            tags={post.tags} // 🌟 PASTIKAN BARIS INI ADA!
          />
        ))}
        
        <div className="text-center text-zinc-500 text-sm mt-6 pb-8">
          ✓ Kamu sudah melihat semua postingan
        </div>
      </div>
    </div>
  );
};

export default HomePage;