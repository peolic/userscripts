// ==UserScript==
// @name        1 Pass For All Sites - Better Episode Image
// @author      peolic
// @version     1.5
// @description Attempt to grab a better episode image.
// @icon        https://1passforallsites.com/media/favicon/favicon-32x32.png
// @namespace   https://github.com/peolic
// @match       https://1passforallsites.com/episode/*
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
    const flashSrc = thumbSrc.endsWith('/mainthumb.jpg') ? thumbSrc.replace('mainthumb.jpg', 'flash.jpg') : null;
    const bigSrc = thumbSrc.endsWith('/mainthumb.jpg') ? thumbSrc.replace('mainthumb.jpg', 'big.jpg') : null;

    const images = [bigSrc, flashSrc, thumbSrc].filter((i) => !!i);
    let errors = 0;

    if (images.length === 0)
      return;

    const handleError = () => {
      if (errors < images.length) {
        target.src = images[errors];
        errors++;
        return;
      }
      target.src = originalSrc;
      unwatch();
    };

    const handleLoad = () => {
      if ((target.naturalHeight - target.naturalWidth) > 10)
        return handleError();
      unwatch();
    };

    const unwatch = () => {
      target.removeEventListener('error', handleError);
      target.removeEventListener('load', handleLoad);
    };

    target.addEventListener('error', handleError);
    target.addEventListener('load', handleLoad);

    target.src = images[0];
  }
})();
