export const recognizeTextFromImage = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      // Прогресс загрузки
      const xhr = new XMLHttpRequest();
  
      const promise = new Promise<string>((resolve, reject) => {
        xhr.open('POST', 'http://localhost:8000/ocr');
        xhr.responseType = 'json';
  
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(event.loaded / event.total);
          }
        };
  
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = xhr.response;
            if (response.status === 'success') {
              resolve(response.lines.join('\n'));
            } else {
              reject(response.message || 'Ошибка при распознавании');
            }
          } else {
            reject(`Ошибка: ${xhr.status}`);
          }
        };
  
        xhr.onerror = () => reject('Ошибка сети');
  
        xhr.send(formData);
      });
  
      return await promise;
    } catch (err) {
      console.error('Ошибка в recognizeTextFromImage:', err);
      return '';
    }
  };
  