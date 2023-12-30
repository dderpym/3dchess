/**
 * @param location - Location to bitmap onto
 * @param maxSize - Size of the board being bitmapped
 * @param isDelta - If the location is a delta, meaning allow for out of bounds
 * @returns the bitmapped location/delta
 */
export function toBitmappedInt(location: number[], maxSize: number[]): number {
  if (location.length !== maxSize.length) {
    throw new Error("Invalid location and size");
  }

  let dimension = 1;
  let value = 0;
  for (let i = 0; i < location.length; i++) {
    value += location[i] * dimension;
    dimension *= maxSize[i];
  }

  return value;
}

export function fromBitmappedInt(
  location: number,
  maxSize: number[],
  isDelta: boolean = false,
): number[] {
  if (location > toBitmappedInt(maxSize, maxSize) || location < 0) {
    throw new Error(
      "Impossible number " + location + " on board of size " + maxSize,
    );
  }

  let dimension = maxSize.reduce((acc, cur) => acc * cur);
  const vect = [];
  for (let i = maxSize.length - 1; i >= 0; --i) {
    dimension /= maxSize[i];
    const diff = Math.floor(location / dimension);
    vect[i] = diff;
    location -= diff * dimension;
  }

  return vect;
}
