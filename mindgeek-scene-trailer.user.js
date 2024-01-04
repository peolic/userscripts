// ==UserScript==
// @name        MindGeek Scene Trailer
// @author      peolic
// @version     1.0
// @description show trailers on MindGeek sites
// @namespace   https://github.com/peolic
// @match       http*://*/scene/*/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/mindgeek-scene-trailer.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/mindgeek-scene-trailer.user.js
// ==/UserScript==

(async () => {

  const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForLoad = async (postInit) => {
    let timeout = 10000;

    const getContentRoot = () => document.querySelector('#root > div[class]:first-of-type');
    while (
      !Object.getOwnPropertyNames(getContentRoot()).find((p) => /^__(reactFiber[a-z]?|reactInternalInstance)\$/.test(p))
      || !document.querySelector('script[type="application/ld+json"]')
    ) {
      if (timeout <= 0) {
        throw new Error('failed to initialize userscript: react search timed-out');
      }
      await wait(50);
      timeout -= 50;
    }

    await wait(postInit);
  };

  await waitForLoad(0);

  const dataJSONLD = document.querySelector('script[type="application/ld+json"]')?.textContent;
  const data = JSON.parse(dataJSONLD);

  const imgEl = document.querySelector(`img[src="${data.thumbnailUrl}"]`);

  const imageLink = document.createElement('a');
  imageLink.innerText = 'Image';
  imageLink.href = imgEl.src;
  imageLink.target = '_blank';
  Object.assign(imageLink.style, {
    position: 'absolute',
    color: 'black',
    top: '-22px',
    right: '15px',
  });

  const video = document.createElement('video');
  video.controls = true;
  video.className = imgEl.className;
  video.poster = imgEl.src;

  if (data.contentUrl) {
    video.src = data.contentUrl;
  } else {
    // poster to video:
    // "https://media-public-ht.project1content.com/m=eaSaaTbWx/ee6/b6a/057/993/459/3b8/4d0/bc1/f32/d7b/7d/poster/poster_01.jpg"
    // "https://prog-public-ht.project1content.com/ee6/b6a/057/993/459/3b8/4d0/bc1/f32/d7b/7d/mediabook/mediabook_720p.mp4"
    video.src = imgEl.src
      .replace('/media-public-ht.', '/prog-public-ht.')
      .replace(/(\.com\/)m=[a-zA-Z]+\//, '$1')
      .replace(/\/poster\/poster_01\.jpg$/, '/mediabook/mediabook_720p.mp4');
  }

  const imgParent = imgEl.parentElement;
  imgParent.appendChild(video);
  while (imgParent.childNodes.length && !imgParent.firstChild.isSameNode(video)) {
    imgParent.firstChild.remove();
  }
  imgParent.prepend(imageLink);

})();
