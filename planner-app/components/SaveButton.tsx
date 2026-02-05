import React from "react";

interface SaveButtonProps {
  show: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export default function SaveButton({
  show,
  onClick,
  isLoading = false,
}: SaveButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      {isLoading ? "Saving..." : "Save Day"}
    </button>
  );
}
