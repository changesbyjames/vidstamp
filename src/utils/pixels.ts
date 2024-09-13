export interface Color {
  r: number;
  g: number;
  b: number;
}

const Colors: Record<number, Color> = {
  0: {
    r: 255,
    g: 0,
    b: 0
  },
  1: {
    r: 255,
    g: 128,
    b: 0
  },
  2: {
    r: 255,
    g: 255,
    b: 0
  },
  3: {
    r: 0,
    g: 255,
    b: 0
  },
  4: {
    r: 0,
    g: 255,
    b: 255
  },
  5: {
    r: 0,
    g: 0,
    b: 255
  },
  6: {
    r: 128,
    g: 0,
    b: 255
  },
  7: {
    r: 255,
    g: 0,
    b: 255
  }
};

export const getColorForBit = (bit: number) => {
  if (bit >= 8) throw new Error('Bit is out of range');
  const color = Colors[bit];
  if (!color) throw new Error('Color not found');
  return color;
};

export const getBitForColor = (color: Color) => {
  const index = getClosestColor(color);
  const bit = parseInt(index);
  if (isNaN(bit)) throw new Error('Bit not found');
  return bit;
};

interface ClosestColor {
  key: string;
  distance: number;
}

export const getClosestColor = (color: Color) => {
  const threshold = 100;

  const closestColor = Object.entries(Colors).reduce<ClosestColor>(
    (closest, [key, value]) => {
      const distance = Math.sqrt((color.r - value.r) ** 2 + (color.g - value.g) ** 2 + (color.b - value.b) ** 2);
      return distance < closest.distance ? { key, distance } : closest;
    },
    { key: '0', distance: Infinity } as ClosestColor
  );

  if (closestColor.distance > threshold) {
    console.log('Color not found', color);
    console.log('Closest color', closestColor);
    console.log('Threshold', threshold);
    console.log('Distance', closestColor.distance);
    console.log('Off by ', closestColor.distance - threshold);
    // throw new Error('Color not found');
  }
  return closestColor.key;
};

export const pixelToSize = (pixel: number) => {
  switch (pixel) {
    case 2:
      return 0;
    case 4:
      return 1;
    case 8:
      return 2;
    case 16:
      return 3;
    case 32:
      return 4;
    case 64:
      return 5;
  }
  throw new Error('Invalid pixel');
};

export const sizeToPixel = (size: number) => {
  switch (size) {
    case 0:
      return 2;
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
      return 16;
    case 4:
      return 32;
    case 5:
      return 64;
  }
  throw new Error('Invalid size');
};
