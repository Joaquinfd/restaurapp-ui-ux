import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        outline:
          "border-border bg-input/30 text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        success:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300 [a]:hover:bg-green-100 dark:[a]:hover:bg-green-950/60",
        info:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-950/60",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-950/60",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

function Badge({
  className,
  variant,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props,
    ),
    render,
    state: { slot: "badge", variant },
  });
}

export { Badge, badgeVariants };
