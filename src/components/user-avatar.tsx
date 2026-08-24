"use client";

import { useState } from "react";
import { resolveAvatarUrl } from "@/lib/game-image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  alt?: string;
}

export function UserAvatar({ src, name, className, alt = "" }: UserAvatarProps) {
  const fallback = resolveAvatarUrl(undefined, name);
  const [imgSrc, setImgSrc] = useState(() => resolveAvatarUrl(src, name));

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn("object-cover bg-zinc-800", className)}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}
