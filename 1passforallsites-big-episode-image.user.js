// ==UserScript==
// @name        1 Pass For All Sites - Better Episode Image
// @author      peolic
// @version     1.0
// @description Attempt to grab a better episode image.
// @icon        https://1passforallsites.com/media/favicon/favicon-32x32.png
// @namespace   https://github.com/peolic
// @include     https://1passforallsites.com/episode/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// ==/UserScript==

(() => {
  const target = document.querySelector('.movie-wrapper > img');
  if (target?.src.endsWith('/movie_tn.jpg')) {
    const currentScene = window.location.href.match(/(^.+\/\d+\/?)/)[1];
    const thumbLink = document.querySelector(`a[href^="${currentScene}"`);
    const thumbSrc = thumbLink.querySelector('img').src;
    const bigSrc = thumbSrc.replace('mainthumb.jpg', 'big.jpg');

    target.addEventListener('error', () => {
      target.src = thumbSrc;
    });

    target.src = bigSrc;
  }
})();
