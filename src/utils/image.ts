export const getImageForClip = async (clip: string) => {
  // This just gets the og:image from the clip page, it's an easy way to get the thumbnail
  const response = await fetch(`https://changesbyjames-getogimage.web.val.run?url=${clip}`);
  const json = await response.json();
  return json.ogImage;
};

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
    img.src = src;
  });
};

export const getImageData = async (url: string) => {
  const img = await loadImage(url);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  ctx.drawImage(img, 0, 0);
  return {
    data: ctx.getImageData(0, 0, img.width, img.height),
    width: img.width,
    height: img.height
  };
};

export const getPixel = (data: ImageData, x: number, y: number) => {
  const index = (y * data.width + x) * 4;
  return {
    r: data.data[index],
    g: data.data[index + 1],
    b: data.data[index + 2],
    a: data.data[index + 3]
  };
};
