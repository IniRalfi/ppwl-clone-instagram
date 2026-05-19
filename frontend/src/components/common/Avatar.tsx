// frontend/src/components/common/Avatar.tsx

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
};

export function Avatar({ name, avatarUrl, size = "md", className = "" }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const sizeClass = sizeClasses[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto profil ${name}`}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-ig-secondary-bg flex items-center justify-center text-ig-text font-semibold flex-shrink-0 ${sizeClass} ${className}`}
      aria-label={`Avatar ${name}`}
    >
      {initial}
    </div>
  );
}