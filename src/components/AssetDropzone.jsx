import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AssetDropzone = ({ label, onFileSelect, file, id }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/60 font-mono">
          {label}
        </label>
        {file && (
          <button 
            onClick={() => onFileSelect(null)}
            className="text-[10px] uppercase font-bold text-rose-500/60 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div 
        {...getRootProps()} 
        className={`relative h-56 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-charcoal-border hover:border-emerald-500/50 bg-charcoal-light/50'}
          ${file ? 'border-emerald-500/30' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-3"
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                     <FileSearch className="w-4 h-4" /> Replace Asset
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6"
            >
              <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-charcoal-border text-gray-500'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-300">
                  {isDragActive ? 'Drop asset here' : 'Drag & drop image'}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-tight">
                  SOURCE INTEGRITY CHECK
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
