import { useState, useEffect, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { t } from "@/lib/i18n";

interface TagInputProps {
  initialTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ initialTags, onChange }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    onChange(tags);
  }, [tags, onChange]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="flex flex-wrap items-center border border-gray-300 rounded-md p-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center m-1 px-2 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800"
        >
          {tag}
          <button
            type="button"
            className="mr-1 text-gray-500 hover:text-gray-700"
            onClick={() => removeTag(index)}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow m-1 outline-none text-sm"
        placeholder={t("addTag")}
      />
    </div>
  );
}
