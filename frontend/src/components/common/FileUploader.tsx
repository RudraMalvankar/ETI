import React, { useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  acceptedFormats?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isLoading = false,
  acceptedFormats = '.pdf,.csv',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center ${
        isDragOver
          ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 border border-blue-500/20 mb-3">
        <UploadCloud className="w-8 h-8" />
      </div>
      <h4 className="text-sm font-bold text-white mb-1">
        {isLoading ? 'Processing & Ingesting PDF...' : 'Drag & drop industrial PDF or CSV manual'}
      </h4>
      <p className="text-xs text-slate-400 max-w-xs mb-3">
        Supports PDF & CSV files up to 50MB for ingestion into Qdrant Vector Index
      </p>

      {selectedFile && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>{selectedFile.name}</span>
          <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}
    </div>
  );
};
