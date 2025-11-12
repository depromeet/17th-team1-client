import { useEffect, useState } from "react";

type MemoryTextareaProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

const MAX_LENGTH = 200;

export const MemoryTextarea = ({
  value,
  onChange,
  placeholder = "여행 도시에 대한 추억을 남겨주세요...",
  rows = 13,
}: MemoryTextareaProps) => {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (value && value.length >= MAX_LENGTH) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange?.(newValue);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="w-full px-2 mt-4">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-secondary/60 resize-none outline-none"
        rows={rows}
        maxLength={MAX_LENGTH}
      />
      {showError && <p className="mb-2 text-xs text-red-400">최대 {MAX_LENGTH}자까지만 입력이 가능합니다.</p>}
    </div>
  );
};
