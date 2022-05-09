// ==UserScript==
// @name        MindGeek Scene Trailer
// @author      peolic
// @version     0.3
// @description show trailers on MindGeek sites
// @namespace   https://github.com/peolic
// @include     *://*/scene/*/*
// @exclude     https://www.bellesafilms.com/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/mindgeek-scene-trailer.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/mindgeek-scene-trailer.user.js
// ==/UserScript==

(async () => {  
  const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const getTitle = () => document.querySelector('h1')?.textContent || document.querySelector('h2')?.textContent || '_____';
  const getImg = () => document.querySelector(`section img[src^="https://media-public-ht.project1content.com"][alt^="${getTitle()}"]`);

  let img = getImg();
  while (!img) {
    img = getImg();
    await wait(100);
  }

  const video = document.createElement('video');
  video.controls = true;
  video.className = img.className;
  video.poster = img.src;
  
  // poster to video:
  // "https://media-public-ht.project1content.com/m=eaSaaTbWx/ee6/b6a/057/993/459/3b8/4d0/bc1/f32/d7b/7d/poster/poster_01.jpg"
  // "https://prog-public-ht.project1content.com/ee6/b6a/057/993/459/3b8/4d0/bc1/f32/d7b/7d/mediabook/mediabook_720p.mp4"
  video.src = img.src
    .replace('/media-public-ht.', '/prog-public-ht.')
    .replace(/(\.com\/)m=[a-zA-Z]+\//, '$1')
    .replace(/\/poster\/poster_01\.jpg$/, '/mediabook/mediabook_720p.mp4');

  const imgParent = img.parentElement;
  imgParent.appendChild(video);
  while (imgParent.childNodes.length && !imgParent.firstChild.isSameNode(video)) {
    imgParent.firstChild.remove();
  }
})();
