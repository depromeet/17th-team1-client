import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-8 py-4 text-xs font-medium text-center leading-[100%]",
  {
    variants: {
      variant: {
        primary: "bg-primary-100 text-primary-600",
        gray: "bg-gray-100 text-gray-600",
        red: "bg-red-100 text-red-600",
        orange: "bg-orange-100 text-orange-600",
        yellow: "bg-yellow-100 text-yellow-600",
        lime: "bg-lime-100 text-lime-600",
        green: "bg-green-100 text-green-600",
        cyan: "bg-cyan-100 text-cyan-600",
        sky: "bg-sky-100 text-sky-600",
        blue: "bg-blue-100 text-blue-600",
        indigo: "bg-indigo-100 text-indigo-600",
        purple: "bg-purple-100 text-purple-600",
        pink: "bg-pink-100 text-pink-600",
        rose: "bg-rose-100 text-rose-600",
      },
    },
    defaultVariants: {
      variant: "gray",
    },
  },
);

export const Badge = ({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "span";

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
};
