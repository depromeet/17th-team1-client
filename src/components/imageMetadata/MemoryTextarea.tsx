type MemoryTextareaProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export const MemoryTextarea = ({
  value,
  onChange,
  placeholder = "여행 도시에 대한 추억을 남겨주세요...",
  rows = 13,
}: MemoryTextareaProps) => {
  return (
    <div className="w-full px-2 mt-4">
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-secondary/60 resize-none outline-none"
        rows={rows}
      />
    </div>
  );
};
