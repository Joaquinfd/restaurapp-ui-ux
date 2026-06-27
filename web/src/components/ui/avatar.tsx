import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200 select-none dark:bg-neutral-900 dark:ring-neutral-800",
  {
    variants: {
      size: {
        sm: "size-8 text-base",
        md: "size-11 text-xl",
        lg: "size-14 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Emoji or short text rendered inside the avatar. */
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/** Round emoji/initial avatar matching the chip avatars already used across the app. */
function Avatar({ children, size, className, label }: AvatarProps) {
  return (
    <span
      className={cn(avatarVariants({ size }), className)}
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}

export { Avatar, avatarVariants };
