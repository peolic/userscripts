// ==UserScript==
// @name        FTVCash - Better Image
// @author      peolic
// @version     1.0
// @description Attempt to grab a better episode image.
// @icon        https://www.ftvgirls.com/favicon.ico
// @namespace   https://github.com/peolic
// @match       https://*.ftvgirls.com/update/*
// @match       https://*.ftvmilfs.com/update/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/ftvcash-better-image.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/ftvcash-better-image.user.js
// ==/UserScript==

//@ts-check
(() => {
  const target = /** @type {HTMLImageElement} */ (document.querySelector('img#Magazine'));
  if (!target)
    return;

  const smallSrc = target.src;
  const bigSrc = smallSrc.replace(/(\/preview)\/.+\.jpg$/, '$1/episode.jpg');

  const useSmall = () => target.src = smallSrc;

  target.addEventListener('error', useSmall);

  const a = document.createElement('a');
  a.href = bigSrc;
  a.target = '_blank';
  target.before(a);
  a.appendChild(target);

  target.src = bigSrc;
})();
