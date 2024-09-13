import { getColorForBit, pixelToSize } from './utils/pixels';

export const Byte: React.FC<{ value: number; size: number }> = ({ value, size }) => {
  const color = getColorForBit(value);
  return (
    <div
      style={{
        height: size,
        width: size,
        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`
      }}
    />
  );
};

interface CodeProps {
  data: Uint8Array;
  size: number;
}

export const Code: React.FC<CodeProps> = ({ data, size }) => {
  return (
    <div style={{ display: 'flex' }}>
      {Array.from(data).map((byte, index) => (
        <Byte key={index} value={byte} size={size} />
      ))}
      <Byte value={pixelToSize(size)} size={size} />
    </div>
  );
};
