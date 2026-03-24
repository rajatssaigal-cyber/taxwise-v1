import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, files, onRemoveFile, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    disabled: isLoading,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'file-invalid-type':
        return 'Invalid file type. Please upload PDF, Excel, or Image files.';
      case 'file-too-large':
        return 'File is too large. Maximum size is 10MB.';
      case 'too-many-files':
        return 'Too many files selected.';
      default:
        return 'Error uploading file. Please try again.';
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden",
          isDragActive ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Upload Investment Documents</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Drag & drop your P&L statements, e-CAS, or MF statements here. PDF, Excel, and Images supported.
        </p>

        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-indigo-600"
            />
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-900 truncate">{file.name}</p>
                <p className="text-[10px] text-red-600 font-medium">
                  {errors.map(e => getErrorMessage(e.code)).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
