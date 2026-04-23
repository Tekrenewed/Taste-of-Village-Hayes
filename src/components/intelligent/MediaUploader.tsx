import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useIntelligentMedia } from '../../context/IntelligentMediaContext';

export const MediaUploader = () => {
  const { selectedFile, previewUrl, handleFile } = useIntelligentMedia();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`bg-white p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px] shadow-sm hover:shadow-md
        ${selectedFile ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-200 hover:border-gray-300'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
      onClick={() => document.getElementById('ai-file-upload')?.click()}
    >
      <input 
        id="ai-file-upload" 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect} 
      />
      
      {previewUrl ? (
        <div className="relative w-full h-full flex flex-col items-center">
          <img src={previewUrl} alt="Preview" className="max-h-[200px] rounded-2xl shadow-lg object-contain" />
          <p className="text-brand-pink font-bold mt-4">Click to change image</p>
        </div>
      ) : (
        <>
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <UploadCloud size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Drag & Drop Raw Photo</h3>
          <p className="text-gray-500 mt-2 text-center max-w-xs text-sm">
            Upload a raw smartphone photo of a dish to transform it into studio-quality media.
          </p>
        </>
      )}
    </div>
  );
};
