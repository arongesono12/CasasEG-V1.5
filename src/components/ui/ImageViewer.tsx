import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  images, 
  initialIndex, 
  onClose 
}) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(prev => (prev - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex(prev => (prev + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-50">
        <Icons.Close className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full p-4 md:p-10 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
          <img src={images[index]} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          
          {images.length > 1 && (
            <>
                <button 
                  onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)} 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => setIndex((prev) => (prev + 1) % images.length)} 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                >
                    <Icons.ChevronRight className="w-8 h-8" />
                </button>
                <div className="absolute bottom-6 flex gap-2">
                    {images.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setIndex(i)}
                          className={`h-2.5 w-2.5 rounded-full transition-all shadow-sm ${i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} 
                        />
                    ))}
                </div>
            </>
          )}
          <div className="absolute bottom-6 right-6 text-white/70 text-sm font-medium px-3 py-1 bg-black/50 rounded-full">
            {index + 1} / {images.length}
          </div>
      </div>
    </div>
  );
};

