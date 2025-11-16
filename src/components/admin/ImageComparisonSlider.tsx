import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparisonSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Depois",
}: ImageComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState([50]);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
        {/* After Image (full) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute top-0 left-0 w-full h-full object-contain"
        />

        {/* Before Image (clipped) */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${sliderPosition[0]}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-contain"
            style={{
              width: "100vw",
              maxWidth: "none",
              position: "absolute",
              left: 0,
            }}
          />
        </div>

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${sliderPosition[0]}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary rounded-full" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {afterLabel}
        </div>
      </div>

      {/* Slider Control */}
      <Slider
        value={sliderPosition}
        onValueChange={setSliderPosition}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
};
