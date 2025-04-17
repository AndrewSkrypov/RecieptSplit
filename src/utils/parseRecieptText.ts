import Tesseract from 'tesseract.js';

export const recognizeTextFromImage = async (
  file: File,
  onProgress?: (p: number) => void
): Promise<string> => {
  const preprocessed = await preprocessImage(file);

  const { data } = await Tesseract.recognize(preprocessed, 'rus', {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    }
  });

  return data.text;
};

// Предобработка — ч/б фильтрация для повышения контраста
const preprocessImage = async (file: File): Promise<string> => {
  const image = new Image();
  const url = URL.createObjectURL(file);

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(url);

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Преобразуем в ч/б
      for (let i = 0; i < data.length; i += 4) {
        const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const value = brightness > 180 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    image.src = url;
  });
};
