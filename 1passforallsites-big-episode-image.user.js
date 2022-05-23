// ==UserScript==
// @name        1 Pass For All Sites - Better Episode Image
// @author      peolic
// @version     1.1
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
    const currentEpisode = window.location.href.match(/(^.+\/\d+\/?)/)[1];
    const thumbLink = /** @type {HTMLAnchorElement} */ (document.querySelector(`a[href^="${currentEpisode}"`));
    const thumbSrc = thumbLink.querySelector('img').src;
    const bigSrc = thumbSrc.replace('mainthumb.jpg', 'big.jpg');

    const useThumb = () => target.src = thumbSrc;

    target.addEventListener('error', useThumb);
    target.addEventListener('load', () => {
      if (target.src === bigSrc && (target.naturalHeight - target.naturalWidth) > 10)
        useThumb();
    });

    target.src = bigSrc;
  }
})();
