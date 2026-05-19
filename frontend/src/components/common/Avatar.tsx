import React from 'react';
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, fallback, className }) => {
  return (
    <ShadcnAvatar className={className}>
      <AvatarImage src={src} alt="User Avatar" className="object-cover" />
      {/* Fallback muncul berupa huruf inisial jika foto profilnya kosong */}
      <AvatarFallback className="bg-zinc-800 text-ig-primary text-sm font-medium uppercase">
        {fallback}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar;