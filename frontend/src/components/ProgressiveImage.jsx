import React from 'react';
import useImageLoader from '../hooks/useImageLoader';

export default function ProgressiveImage({
  src,
  alt = 'Image',
  placeholderSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/></svg>',
  lazy = true,
  className = '',
  imageClassName = '',
  skeletonHeight = 'h-full',
}) {
  const { currentSrc, isLoaded, hasError, elementRef } = useImageLoader(src, placeholderSrc, lazy);

  return (
    <div 
      ref={elementRef} 
      className={`relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 ${className}`}
    >
      {/* Skeleton Pulse Overlay */}
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 bg-gradient-to-r from-neutral-150 via-neutral-200 to-neutral-150 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 animate-pulse ${skeletonHeight}`} />
      )}

      {/* Actual Rendered Image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${
          isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-40 blur-md scale-95'
        } ${imageClassName}`}
      />
      
      {/* Error State representation */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-850 text-neutral-400 text-xs">
          Failed to load image
        </div>
      )}
    </div>
  );
}
