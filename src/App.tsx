import { format } from 'date-fns';
import { useState } from 'react';
import { recreateDateFromTimestamp } from './utils/date';
import { getImageData, getImageForClip } from './utils/image';
import { Color, getBitForColor, getColorForBit, sizeToPixel } from './utils/pixels';
import { timestamp } from './utils/timestamp';

interface Result {
  detected: Color[];
  closest: Color[];

  image: string;
  data: ReturnType<typeof timestamp.deserialise>;
}

function App() {
  const [result, setResult] = useState<Result>();
  const [clip, setClip] = useState<string>(
    'https://www.twitch.tv/strangecyan/clip/AbnegateGentleLorisKAPOW-tdWJDT7g4SWdILLq'
  );

  const onSubmit = async () => {
    if (!clip) {
      alert('No clip provided');
      return;
    }
    const url = await getImageForClip(clip);
    const image = await getImageData(url);

    const pixel = getPixel(image.data, image.width - 2, 2);
    const bit = getBitForColor(pixel);
    const step = sizeToPixel(bit);

    const steps = Math.ceil(timestamp.size / timestamp.options.wordSize);
    const detected = [];
    const closest = [];
    const data: number[] = [];
    for (let i = steps - 1; i >= 1; i--) {
      const pixel = getPixel(image.data, image.width - step / 2 - step * i, step / 2);
      detected.push(pixel);
      const bit = getBitForColor(pixel);
      data.push(bit);
      closest.push(getColorForBit(bit));
    }

    const payload = timestamp.deserialise(new Uint8Array(data));

    setResult({
      detected,
      closest,
      image: url,
      data: payload
    });
  };

  return (
    <div
      className="px-8 w-full max-w-6xl mx-auto"
      style={{
        padding: 20,
        width: '100%',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'sans-serif'
      }}
    >
      <p>
        This is a very basic proof of concept of a timestamp (and extra data) overlay for stream. This is a clip
        captured from a test stream on my channel with a small overlay in the top right corner (also included in this
        code). Using the twitch clip, I get the thumbnail for it and recover the information.
      </p>
      <p>
        I've found that using 8 different colors for each square is a good balance. Too few (just black and white for
        example would make this 36 squares long) and it takes up too much, too many colors and we start losing accuracy
        when recovering. 8 colors gives us a word size of 3 bits. So ~36 bits of data, down to 12 squares. I add an
        extra square to the end to signify the square size, e.g. 4px, 8px, etc. so that we could change the size of the
        later and still be able to read it. That's currently implemented.
      </p>
      <p>
        2px per square is too small, 4px seems to be the sweet spot. I've written a custom `BitStruct` class to help
        with packing and unpacking the data so this is as small as it can be. It's totally possible to add some error
        correction to this too, I just haven't in this POC.
      </p>
      <p>
        We're also not limited to what's currently being encoded. Currently it supports encoding what the main cam is
        but if we wanted to store more information it's easy to do.
      </p>
      <p style={{ fontSize: 10 }}>Click submit!</p>
      <input style={{ width: '100%' }} type="text" value={clip} onChange={e => setClip(e.target.value)} />
      <button onClick={onSubmit}>Submit</button>
      {result && (
        <div>
          <a href={clip}>{clip}</a>
          <pre style={{ fontSize: 10, margin: 0 }}>{JSON.stringify(result.data, null, 2)}</pre>
          <p style={{ fontSize: 70, margin: 0 }}>{format(recreateDateFromTimestamp(result.data), 'dd MMM HH:mm:ss')}</p>
          <p style={{ fontSize: 40, margin: 0 }}>Cam: {result.data.cam}</p>
          <label>Detected colors:</label>
          <div style={{ display: 'flex' }}>
            {result.detected.map((a, index) => (
              <div
                key={`${a.r}-${a.g}-${a.b}-${index}`}
                style={{
                  height: 10,
                  width: 10,
                  backgroundColor: `rgb(${a.r}, ${a.g}, ${a.b})`
                }}
              />
            ))}
          </div>
          <label>Closest colors:</label>
          <div style={{ display: 'flex' }}>
            {result.closest.map((a, index) => (
              <div
                key={`${a.r}-${a.g}-${a.b}-${index}`}
                style={{
                  height: 10,
                  width: 10,
                  backgroundColor: `rgb(${a.r}, ${a.g}, ${a.b})`
                }}
              />
            ))}
          </div>
          <img width={900} src={result.image} />
        </div>
      )}
    </div>
  );
}

const getPixel = (data: ImageData, x: number, y: number) => {
  const index = (y * data.width + x) * 4;
  return {
    r: data.data[index],
    g: data.data[index + 1],
    b: data.data[index + 2],
    a: data.data[index + 3]
  };
};

export default App;
