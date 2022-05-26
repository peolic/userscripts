// ==UserScript==
// @name        1 Pass For All Sites - Better Episode Image
// @author      peolic
// @version     1.3
// @description Attempt to grab a better episode image.
// @icon        https://1passforallsites.com/media/favicon/favicon-32x32.png
// @namespace   https://github.com/peolic
// @include     https://1passforallsites.com/episode/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// ==/UserScript==

//@ts-check
(() => {
  const target = /** @type {HTMLImageElement} */ (document.querySelector('.movie-wrapper > img'));
  if (target?.src.endsWith('/movie_tn.jpg')) {
    const originalSrc = target.src;
    const currentEpisode = window.location.href.match(/(^.+\/\d+\/?)/)[1];
    const thumbLink = /** @type {HTMLAnchorElement} */ (document.querySelector(`a[href^="${currentEpisode}"`));
    if (!thumbLink)
      return;

    const thumbSrc = thumbLink.querySelector('img').src;
    const bigSrc = thumbSrc.endsWith('/mainthumb.jpg') ? thumbSrc.replace('mainthumb.jpg', 'big.jpg') : null;

    const useThumb = () => {
      if (target.src === thumbSrc) {
        target.src = originalSrc;
        return target.removeEventListener('error', useThumb);
      }
      target.src = thumbSrc;
    };

    target.addEventListener('error', useThumb);
    target.addEventListener('load', () => {
      if (target.src === bigSrc && (target.naturalHeight - target.naturalWidth) > 10)
        useThumb();
    });

    target.src = bigSrc ?? thumbSrc;
  }
})();
