import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  label: string;
  onClick: () => void;
  format?: 'pdf' | 'docx' | 'json';
  isLoading?: boolean;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  label,
  onClick,
  format = 'pdf',
  isLoading = false,
  disabled = false,
}) => {
  const formatColors = {
    pdf: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10',
    docx: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/10',
    json: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-md ${
        formatColors[format]
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>{label}</span>
    </button>
  );
};
