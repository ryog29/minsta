export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) resolve(file);
    }, 'image/png');
  });
};
