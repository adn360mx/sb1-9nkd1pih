import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download } from 'lucide-react';

interface ImageData {
  original: string;
  optimized: string | null;
  name: string;
  originalSize: number;
  optimizedSize: number | null;
}

export function ImageOptimizer() {
  const [image, setImage] = useState<ImageData | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          original: e.target?.result as string,
          optimized: null,
          name: file.name,
          originalSize: file.size,
          optimizedSize: null
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const optimizeImage = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const optimized = canvas.toDataURL('image/jpeg', quality / 100);
      
      // Calcular tamaño aproximado del archivo optimizado
      const optimizedSize = Math.round((optimized.length - 22) * 3 / 4);
      
      setImage({
        ...image,
        optimized,
        optimizedSize
      });
    };
    
    img.src = image.original;
  };

  const downloadOptimized = () => {
    if (!image?.optimized) return;
    
    const link = document.createElement('a');
    link.download = `optimized-${image.name}`;
    link.href = image.optimized;
    link.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Optimizador de Imágenes
        </h1>

        <div className="space-y-6">
          {/* Área de carga */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              Haz clic o arrastra una imagen aquí para comenzar
            </p>
          </div>

          {image && (
            <>
              {/* Controles */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calidad ({quality}%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ancho máximo ({maxWidth}px)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3840"
                    step="100"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={optimizeImage}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Optimizar Imagen
                </button>
              </div>

              {/* Previsualización */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Original</h3>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.original}
                      alt="Original"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Tamaño: {formatSize(image.originalSize)}
                  </p>
                </div>

                {image.optimized && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Optimizada</h3>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.optimized}
                        alt="Optimizada"
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Tamaño: {formatSize(image.optimizedSize || 0)}
                      {image.optimizedSize && (
                        <span className="ml-2 text-green-600">
                          ({Math.round((1 - image.optimizedSize / image.originalSize) * 100)}% reducción)
                        </span>
                      )}
                    </p>
                    <button
                      onClick={downloadOptimized}
                      className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar Optimizada
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}