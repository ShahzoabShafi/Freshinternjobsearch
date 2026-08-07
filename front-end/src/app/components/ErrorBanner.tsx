import { AlertCircle, X } from "lucide-react";
import React from "react";

export default function ErrorBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">Couldn&apos;t load listings — please check your connection and try again.</span>
      <button
        onClick={onDismiss}
        className="hover:text-red-900 transition-colors p-0.5 rounded"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}