import { useState, useEffect, useRef } from 'react';

export default function useImageLoader(src, placeholderSrc, lazy = true) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(placeholderSrc || '');

    if (!src) return;

    const loadImage = () => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        setCurrentSrc(src);
      };
      img.onerror = () => {
        setHasError(true);
        setCurrentSrc(placeholderSrc || '');
      };
    };

    if (!lazy || !('IntersectionObserver' in window)) {
      loadImage();
      return;
    }

    // Lazy load using Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            // Disconnect once loaded/triggered
            if (observerRef.current && elementRef.current) {
              observerRef.current.unobserve(elementRef.current);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Trigger slightly before it enters viewport
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, placeholderSrc, lazy]);

  return { currentSrc, isLoaded, hasError, elementRef };
}
