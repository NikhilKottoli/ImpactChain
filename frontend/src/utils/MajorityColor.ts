import type { get } from "http";

const getMajorityColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Downscale image for performance
      const width = 50;
      const height = 50;
      canvas.width = width;
      canvas.height = height;

      context?.drawImage(img, 0, 0, width, height);

      const imageData = context?.getImageData(0, 0, width, height).data;
      if (!imageData) {
        resolve("#FFFFFF");
        return;
      }

      const colorCount: Record<string, number> = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${
          Math.round(b / 16) * 16
        }`;
        // bucket into steps of 16 to reduce uniqueness

        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      // Find the most frequent color
      let dominantColor = "#FFFFFF";
      let maxCount = 0;

      Object.entries(colorCount).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = `rgb(${key})`;
        }
      });

      resolve(dominantColor);
    };

    img.onerror = () => resolve("#26AFE0");
  });
};

export default getMajorityColor;
