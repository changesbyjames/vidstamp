import { BitSet } from 'bitset';

type BitStructInputSchema<K extends string> = Record<K, number>;
type BitStructSchema<K extends string> = Record<
  K,
  {
    size: number;
    position: number;
  }
>;

interface BitStructOptions {
  wordSize: number;
}

export class BitStruct<K extends string> {
  public schema: BitStructSchema<K>;
  public size: number;
  public options: BitStructOptions;
  constructor(input: BitStructInputSchema<K>, options: BitStructOptions) {
    let offset = 0;
    const schema: Partial<BitStructSchema<K>> = {};
    for (const key in input) {
      const size = input[key];
      schema[key] = {
        size,
        position: offset
      };
      offset += size;
    }
    this.schema = schema as BitStructSchema<K>;
    this.size = offset;
    this.options = options;
  }

  private pack(data: Record<K, number>) {
    const set = new BitSet();
    for (const key in this.schema) {
      const size = this.schema[key].size;
      const value = data[key];
      if (value > (1 << size) - 1) {
        throw new Error(`Value ${value} for key ${key} is too large`);
      }
      const position = this.schema[key].position;
      const binary = value.toString(2).padStart(size, '0');
      for (let i = 0; i < binary.length; i++) {
        set.set(position + size - 1 - i, binary[i] === '1' ? 1 : 0);
      }
    }
    return set;
  }

  private unpack(set: BitSet) {
    const data: Partial<Record<K, number>> = {};
    for (const key in this.schema) {
      const size = this.schema[key].size;
      const position = this.schema[key].position;
      let value = 0;
      for (let i = 0; i < size; i++) {
        const bit = set.get(position + size - 1 - i) ? 1 : 0;
        value = (value << 1) | bit;
      }
      data[key] = value;
    }
    return data as Record<K, number>;
  }

  serialise(input: Record<K, number>) {
    const set = this.pack(input);
    const length = set.msb() + 1; // Total bits (since msb() is zero-based)
    const wordCount = Math.ceil(length / this.options.wordSize);

    const words = new Uint8Array(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const start = i * this.options.wordSize;
      const end = Math.min((i + 1) * this.options.wordSize - 1, length - 1); // Adjusted end index
      let value = 0;
      for (let j = 0; j <= end - start; j++) {
        const bit = set.get(start + end - start - j) ? 1 : 0;
        value = (value << 1) | bit;
      }
      words[i] = value;
    }

    return {
      data: words,
      bin: set.toString(),
      rep: words.join('-'),
      input
    };
  }

  deserialise(words: Uint8Array) {
    const set = new BitSet();
    const totalBits = this.size; // Total expected bits
    for (let i = 0; i < words.length; i++) {
      const start = i * this.options.wordSize;
      const end = Math.min((i + 1) * this.options.wordSize - 1, totalBits - 1); // Adjusted end index
      const bitLength = end - start + 1; // Number of bits in this word
      const binary = words[i].toString(2).padStart(bitLength, '0');
      for (let j = 0; j < binary.length; j++) {
        const bit = binary[j] === '1' ? 1 : 0;
        set.set(start + bitLength - 1 - j, bit);
      }
    }
    return this.unpack(set);
  }
}
