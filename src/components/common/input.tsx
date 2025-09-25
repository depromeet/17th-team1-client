import { cva, type VariantProps } from "class-variance-authority";
import { Upload } from "lucide-react";
import SearchIcon from "@/assets/icons/search.svg";
import { cn } from "@/utils/cn";

const inputVariants = cva(
  "flex w-full items-center justify-center rounded-3xl p-3 text-sm outline-none placeholder:text-gray-400 focus:outline-primary-600 focus:shadow-primary focus:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 h-12",
  {
    variants: {
      isDark: {
        true: "bg-gray-700 text-white outline-gray-500",
        false: "bg-white text-gray-900 outline-gray-200",
      },
    },
    defaultVariants: {
      isDark: false,
    },
  },
);

const iconStyles = "absolute top-1/2 left-3 -translate-y-1/2 text-gray-500";

export const Input = ({
  className,
  type,
  isDark,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants> & { variant?: "success" | "fail" }) => {
  return (
    <div className={cn("relative", className)}>
      <input type={type} data-slot="input" className={cn(inputVariants({ isDark }), className)} {...props} />
    </div>
  );
};

export const SearchInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <div className={cn("relative", className)}>
      <input type="text" data-slot="search-input" className={cn(inputVariants(), "pl-10 pr-3")} {...props} />
      <div className={iconStyles} style={{ width: 24, height: 24 }}>
        <SearchIcon size={24} />
      </div>
    </div>
  );
};

export const ImageUploadInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <div className={cn("relative", className)}>
      <input type="file" data-slot="image-upload-input" className={cn(inputVariants(), "pl-10 pr-3")} {...props} />
      <div className={iconStyles} style={{ width: 24, height: 24 }}>
        <Upload size={24} />
      </div>
    </div>
  );
};
