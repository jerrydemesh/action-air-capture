import { useState } from "react";
import { cn } from "@/lib/utils";

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkText?: string;
}

const WatermarkedImage = ({ src, alt, className, watermarkText = "Action Aerials" }: WatermarkedImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className={cn("relative overflow-hidden select-none", className)}
      onContextMenu={handleContextMenu}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none"
        onLoad={() => setImageLoaded(true)}
        onDragStart={handleDragStart}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      />
      
      {imageLoaded && (
        <>
          {/* Main diagonal watermarks */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 w-full h-full opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <span 
                      className="text-white text-lg font-bold rotate-45 whitespace-nowrap"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                      }}
                    >
                      {watermarkText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Corner watermarks */}
          <div className="absolute top-4 left-4 text-white text-sm font-semibold opacity-80 pointer-events-none">
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {watermarkText}
            </span>
          </div>
          
          <div className="absolute bottom-4 right-4 text-white text-sm font-semibold opacity-80 pointer-events-none">
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              {watermarkText}
            </span>
          </div>

          {/* Subtle overlay to prevent screenshots */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-br from-white via-transparent to-white"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`
            }}
          />
        </>
      )}

      {/* Invisible overlay to prevent right-click */}
      <div className="absolute inset-0 cursor-default" />
    </div>
  );
};

export default WatermarkedImage;