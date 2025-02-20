// ==UserScript==
// @name        Compute PHash
// @author      peolic
// @version     1.01
// @description Compute the Perceptual Hash of an online video (using the StashApp implementation). May not work for every video player.
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFSElEQVRYR+2We1CUVRjGf9/usty9wQIbqwtoooISKCjeuYyZpqYZasIMiLeGGizTRu020+ikk1I501iGTjlWSl5GkDQdwmugIqmIIJBxMRABZSXYK9vZlUQF7c/6g3fmzHznnPe85/me85zn+6TmpjIr/2FIPQB6GOhh4H/JgMwqR7JYsRrNwiEkMJuxtosmejJHJe0O4kEh7+Ie8nY5Vovl/rwt1yKJ1RIWWbu9THfR1QesVprSdiDf/SVyUytYDJh8g5EbDShulyH11qCIfRFFyiIk774PakotJqoXLsIjJJQan74ELk2kJnUtvdraqAsLIWB5AjKFoguGLgAkk4X6hNcYeOUXe7JFBhemJVNfdJmxAQF45OyxjxtDY7iZsgSPyJH2flveZeRJL9MeE0dG9kG0n2wleN0yvCKns/d0DvdSUkl4IwmZTBR8KLoAkOmt1I8dTYDhjj1N76HlZzcVWa0GomJjmfVdGi6CznbRTk2ah2LudEaEj6Lx+wOo09bRuCCV81VVOIeGMXLrezjMTOJsbR05ag2p76bg7u76dACWqtu0TRnLMx1H3Boxjb1nc8kcHEryxPFM3LkRN5ssRJnCl5bhqmvGNXc/CosRXzGuF+sarQqhGQs+QjWSeOFbKGiMnQ/RY9DOeP7pAO5ln8R9ZTK9Opiqi4pj3+H9nJgwlTW93RiR8wM2bK2aIM75D2WQ2YjqRimODaWIPTF5B9o3UN6pRDLoMXj60e6l4WIfT44WFhD91eeEhQV3aufxa9iwcRvabzfbN7FFVeI7XLNR6uTEgMyd+IkJg9KR67GvkpfxDS0RUYzSDsA/NwuViytnBFNtTQ2MUDqgvpLDxTkplGcdQNdUxwX/YILi40hOntc9AKvJTMPy1QzMy7wvQNEuzlqKwsEB3/o63Fp03OvVh3KjiZLjhyhW+VE2ZChrFsyl/1tJeIZPYe/5PGqnz+WVU9n4yiWOeWrJbG6h1tsHhbsbqa8nEhoa1D0AmUni1qRoBjZX3Regmyc5/YfxU209PuJ81Y1/Yja0olM4Ue49AIcxkczx8sTXZEC161NcgsZRrPHH7KlCvTsNH29/SsfEcNdXgzVQQ+DkSByVyidrQNIZaYoIQtvBvz4kmn1XLpHZ/1mmLY2nvOAyxcVl6AUjfVT9WKz1Y9D2j+kn8p0FQJvXtAm3shmWo+jYyohLhfG5aHKamxmevhWVj+rJAPT5RcgTZ+PRIcA7QoB7MveSFR7NxrQP0Wh80OlahMKt4jq5oT9VgHLPj/Qqv4pDbSm6UVMxOzvjUl+LU2kefwVG0ualptrZlXMHdlM4ewEbt3yAJHXa4iM+0JSegXrzWjt6W5QJAIeOHub0hFi2b9uA8jH69HX15K1YR7AA5Hf1BPlR8ynM3s/kF2YxNDeDkqh55GZl0Kp0ocpDTWXgENK/3oTDQ47YCUB4eP3q9Qw6ssu+uY3Gc5PjyDxzmuYZM1j/0duPUPdPx9pqpnHiBLxc3Tnp4ctZg5kkd2d8S85QEDmTzPx8KkaF01+jZtL4CKKixz7hCMwWKrekYywvfwCg5vcKjrcZCVi0kMXJwki6CzF/Y9MXNJRXUHHiCOdHxxAfMhx5dTXXjx3k1wHDCF2cQHz87G6XP3IEd4uusfPN92nW3XuQXOnlQ/yKJcTEjOsegBhtLCphh1j3h0xOk0rF+lXLOL7hM0puN1Gj8mLVymWER4T8OwBbxs2bdRT+dvWR5MjRYXh4dn75uqt0+1YjhZeKCRzsj9ZPQ0tLK/n5heIqqggKHvxE8D2/5T0M9DDQw8Dfcw1UX7ZkbUIAAAAASUVORK5CYII=
// @namespace   https://github.com/peolic
// @match       *://*/*
// @grant       GM.registerMenuCommand
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/compute-phash.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/compute-phash.user.js
// ==/UserScript==

//@ts-check

//@ts-expect-error
GM.registerMenuCommand('▶️ Run', () => {
  computePHash();
});

async function computePHash() {

  const video = document.querySelector('video');
  // make sure video is loaded
  if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) {
    alert('video is not ready');
    return;
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitForSeek = (video) => new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true, passive: true }));

  if (!video.paused) video.pause();

  const computeStatus = document.createElement('h1');
  Object.assign(computeStatus.style, { fontSize: '3.5em', fontFamily: 'monospace' });
  computeStatus.innerText = `Compute PHAsh: Generating sprite...`;
  document.body.prepend(computeStatus);

  const videoDuration = video.duration;

  // implementation https://github.com/stashapp/stash/blob/v0.25.1/pkg/hash/videophash/phash.go
  const screenshotSize = 160;
  const columns = 5;
  const rows = 5;
  const chunkCount = columns * rows;
  const offset = 0.05 * videoDuration;
  const stepSize = (0.9 * videoDuration) / chunkCount;

  const videoRatio = video.videoWidth / video.videoHeight;
  const width = screenshotSize;
  const height = Math.trunc(width/videoRatio);

  const sprite = document.createElement('canvas');
  sprite.width = width * columns;
  sprite.height = height * rows;
  const spriteCtx = /** @type {CanvasRenderingContext2D} */ (sprite.getContext('2d', { alpha: false }));

  computeStatus.after(sprite);

  for (let index = 0; index < chunkCount; index++) {
    const time = offset + (index * stepSize);

    const formattedTime = `${Math.trunc(time/60).toString().padStart(2, '0')}:${(time%60).toFixed(0).padStart(2, '0')}`;
    computeStatus.innerText = `Generating sprite... #${index+1}/${chunkCount}  @ ${formattedTime}`;

    // on seeked event fire, new frame should be visible
    const seekedPromise = waitForSeek(video);
    video.currentTime = time;
    await seekedPromise;
    console.log(`#${index+1}/${chunkCount}  @ ${formattedTime}  [${time}]`);
    await wait(100);

    // draw image to sprite, scale to target dimensions
    const x = width * (index % columns);
    const y = height * Math.trunc(index/rows);
    spriteCtx.drawImage(video, x, y, width, height);
  }

  try {
    const spriteBlob = await new Promise((resolve) => sprite.toBlob(resolve));
    const spriteBlobURL = URL.createObjectURL(spriteBlob);
    const spriteImage = document.createElement('img');
    spriteImage.addEventListener('load', () => {
      // don't revoke -- enables the option to download the sprite
      // URL.revokeObjectURL(spriteBlobURL);
      sprite.replaceWith(spriteImage);
    }, { once: true, passive: true });
    spriteImage.src = spriteBlobURL;
  } catch (error) {
    // computeStatus.after(sprite);
  }
  console.log('done');

  /**
   * @param {HTMLCanvasElement} sprite
   * @see https://github.com/gumuz/looks-like-it/blob/master/index.html
   */
  const phash = async (sprite) => {
    /**
     * DCT type II, unscaled. Algorithm by Byeong Gi Lee, 1984.
     * https://www.nayuki.io/page/fast-discrete-cosine-transform-algorithms
     * @param {number[]|Float64Array} vector
     * @returns {void}
     */
    const fastDctLee = (vector) => {
      const n = vector.length;
      if (n <= 0 || (n & (n - 1)) != 0)
        throw new RangeError("Length must be power of 2");
      _fastDctLeeInternal(vector, 0, n, new Float64Array(n));
    };

    /**
     * @param {number[]|Float64Array} vector
     * @param {number} off
     * @param {number} len
     * @param {number[]|Float64Array} temp
     * @returns {void}
     */
    const _fastDctLeeInternal = (vector, off, len, temp) => {
      if (len == 1)
        return;
      const halfLen = Math.floor(len / 2);
      for (let i = 0; i < halfLen; i++) {
        const x = vector[off + i];
        const y = vector[off + len - 1 - i];
        temp[off + i] = x + y;
        temp[off + i + halfLen] = (x - y) / (Math.cos((i + 0.5) * Math.PI / len) * 2);
      }
      _fastDctLeeInternal(temp, off, halfLen, vector);
      _fastDctLeeInternal(temp, off + halfLen, halfLen, vector);
      for (let i = 0; i < halfLen - 1; i++) {
        vector[off + i * 2 + 0] = temp[off + i];
        vector[off + i * 2 + 1] = temp[off + i + halfLen] + temp[off + i + halfLen + 1];
      }
      vector[off + len - 2] = temp[off + halfLen - 1];
      vector[off + len - 1] = temp[off + len - 1];
    }

    /**
     * MedianOfPixelsFast64 function returns a median value of pixels.
     * It uses quick selection algorithm.
     * @param {number[]|Float64Array} pixels
     * @returns {number}
     */
    const medianOfPixelsFast64 = (pixels) => {
      const tmp = pixels.slice();
      const len = tmp.length;
      const pos = len / 2;
      return quickSelectMedian(tmp, 0, len-1, pos);
    };

    /**
     * @param {number[]|Float64Array} sequence
     * @param {number} low
     * @param {number} hi
     * @param {number} k
     * @returns {number}
     */
    const quickSelectMedian = (sequence, low, hi, k) => {
      if (low == hi) {
        return sequence[k];
      }

      while (low < hi) {
        const pivot = Math.trunc(low/2) + Math.trunc(hi/2);
        const pivotValue = sequence[pivot];
        let storeIdx = low;
        [sequence[pivot], sequence[hi]] = [sequence[hi], sequence[pivot]];
        for (let i = low; i < hi; i++) {
          if (sequence[i] < pivotValue) {
            [sequence[storeIdx], sequence[i]] = [sequence[i], sequence[storeIdx]];
            storeIdx++;
          }
        }
        [sequence[hi], sequence[storeIdx]] = [sequence[storeIdx], sequence[hi]];
        if (k <= storeIdx) {
          hi = storeIdx;
        } else {
          low = storeIdx + 1;
        }
      }

      if (sequence.length % 2 == 0) {
        return sequence[k-1]/2 + sequence[k]/2;
      }
      return sequence[k];
    }


    const hashCanvas = document.createElement('canvas');
    hashCanvas.width = 64;
    hashCanvas.height = 64;
    const hashCtx = /** @type {CanvasRenderingContext2D} */ (hashCanvas.getContext('2d', { alpha: false }));

    // load + resize sprite
    const resizeQuality = 'medium';
    try {
      // https://caniuse.com/mdn-api_createimagebitmap
      // Parameter `resizeQuality` unsupported in Firefox 125
      // https://caniuse.com/mdn-api_createimagebitmap_options_resizequality_parameter
      const imageBitmap = await createImageBitmap(
        sprite,
        { resizeWidth: hashCanvas.width, resizeHeight: hashCanvas.height, resizeQuality }
      );
      hashCtx.drawImage(imageBitmap, 0, 0);
    } catch (error) {
      console.warn('failed using `createImageBitmap`, falling back to canvas resize');
      hashCtx.imageSmoothingEnabled = true;
      hashCtx.imageSmoothingQuality = resizeQuality;
      hashCtx.drawImage(sprite, 0, 0, hashCanvas.width, hashCanvas.height);
    }

    const pixels = hashCtx.getImageData(0, 0, hashCanvas.width, hashCanvas.height);

    // grayscale value base on luminosity
    const resized = new Float64Array(64*64);
    for (let i = 0; i < 64; i++) {
      for (let j = 0; j < 64; j++) {
        const pixelOffset = (i*4)*64 + j*4;
        const [r, g, b, _] = pixels.data.subarray(pixelOffset, pixelOffset+4);
        // pixel2Gray converts a pixel to grayscale value base on luminosity
        // note: golang color values are multiplied
        resized[(i*64)+j] = 0.299*r + 0.587*g + 0.114*b;
      }
    }
    // hashCtx.putImageData(pixels, 0, 0);

    // DCT2: input resized[64*64]
    for (let i = 0; i < 64; i++) { // height
      fastDctLee(resized.subarray(i*64, (i*64)+64));
    }
    for (let i = 0; i < 64; i++) { // width
      const row = new Float64Array(64);
      for (let j = 0; j < 64; j++) {
        row[j] = resized[i+(j*64)];
      }
      fastDctLee(row.subarray());
      for (let j = 0; j < row.length; j++) {
			  resized[i+(j*64)] = row[j];
      }
    }

    // flatten [64*64] to [64] (first 8 values of every 8th row)
    const flattens = new Float64Array(64);
    for (let i = 0; i < 8; i++) { // y/height
      for (let j = 0; j < 8; j++) { // x/width
        flattens[(8*i)+j] = resized[(i*64)+j];
      }
    }

    // compute median
    const median = medianOfPixelsFast64(flattens);

    let hash = 0n;
    flattens.forEach((p, idx) => {
      if (p > median) {
        hash |= 1n << (64n - BigInt(idx) - 1n) // leftShiftSet
      }
    });

    return hash.toString(16);
  };

  const result = await phash(sprite);
  console.log('phash=', result);
  computeStatus.innerText = `PHash= ${result}`;

}
