import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { useApp } from '../context/AppContext';

// Helper to create the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as a base64 string
  return canvas.toDataURL('image/jpeg', 0.7);
};

export default function ImageCropper({ imageSrc, onCropCompleteAction, onCancel }) {
  const { selectedLanguage } = useApp();
  const t = (key) => getTranslation(selectedLanguage, key);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Remove the prefix (data:image/jpeg;base64,) if necessary for capacitor/supabase
      const base64Data = croppedImageBase64.split(',')[1];
      onCropCompleteAction(base64Data);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none h-16 bg-black/90 px-4 flex items-center justify-between text-white z-10 pt-2 border-b border-neutral-800">
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X size={24} />
        </button>
        <span className="font-headline font-bold text-lg">{t('Crop Photo')}</span>
        <button 
          onClick={handleSave}
          disabled={isProcessing}
          className={`p-2 rounded-full ${isProcessing ? 'text-neutral-500' : 'text-[#ca0013] hover:bg-neutral-800'} transition-colors`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={24} />
          )}
        </button>
      </div>

      {/* Cropper Container */}
      <div className="flex-1 relative bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          classes={{
            containerClassName: 'absolute inset-0'
          }}
        />
      </div>

      {/* Footer Controls */}
      <div className="flex-none h-24 bg-black/90 px-6 flex flex-col justify-center items-center gap-2 z-10 border-t border-neutral-800">
        <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold">Zoom</p>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          className="w-full max-w-[300px] h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ca0013]"
        />
      </div>
    </div>
  );
}
