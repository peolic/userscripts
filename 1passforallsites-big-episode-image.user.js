// ==UserScript==
// @name        1 Pass For All Sites - Better Episode Image
// @author      peolic
// @version     2.0
// @description Attempt to grab a better episode image.
// @icon        https://1passforallsites.com/media/favicon/favicon-32x32.png
// @namespace   https://github.com/peolic
// @match       https://1passforallsites.com/episode/*
// @match       https://1passforallsites.com/model?id=*
// @grant       GM.addStyle
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/1passforallsites-big-episode-image.user.js
// ==/UserScript==

//@ts-check
(() => {

  function main() {
    handleEpisodePage();
    handleModelPage();
  }

  function handleEpisodePage() {
    if (!window.location.pathname.startsWith('/episode/'))
      return;

    // Fix grabbing image when a trailer is available
    //@ts-expect-error
    GM.addStyle(`
      .mejs__overlay-play { pointer-events: none; }
      .mejs__overlay-play [role="button"] { pointer-events: auto; }
    `);

    const target = /** @type {HTMLImageElement} */ (document.querySelector('.movie-wrapper > img'));
    if (!target?.src.endsWith('/movie_tn.jpg'))
      return;

    const currentEpisode = window.location.href.match(/(^.+\/\d+\/?)/)?.[1];
    if (!currentEpisode)
      return;

    const thumbLink = /** @type {HTMLAnchorElement} */ (document.querySelector(`a[href^="${currentEpisode}"`));
    if (!thumbLink)
      return;

    const thumbSrc = thumbLink.querySelector('img')?.src;
    if (!thumbSrc)
      return;

    handleImg(target, thumbSrc);
  }

  function handleModelPage() {
    if (!window.location.pathname.startsWith('/model'))
      return;

    /** @type NodeListOf<HTMLImageElement> */
    (document.querySelectorAll('.model-sets img')).forEach((img) =>
      img.addEventListener(
        'mouseover',
        () => handleImg(img),
        { once: true, passive: true },
      )
    );
  }

  /**
   * @param {string} src
   * @param {string} repl
   * @returns {string}
   */
  const replaceMainThumb = (src, repl) =>
    src.endsWith('/mainthumb.jpg')
      ? src.replace('mainthumb.jpg', repl)
      : '';

  /**
   * @param {HTMLImageElement} target
   * @param {string} [thumb]
   */
  const handleImg = (target, thumb) => {
    const thumbSrc = thumb || target.src;
    const originalSrc = thumbSrc;

    const flashSrc = replaceMainThumb(thumbSrc, 'flash.jpg');
    const bigSrc = replaceMainThumb(thumbSrc, 'big.jpg');

    const images = [bigSrc, flashSrc, thumbSrc].filter((i) => !!i);

    if (!thumb)
      images.splice(0, 0, replaceMainThumb(thumbSrc, 'player.jpg'));

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
      Object.assign(target.style, { cursor: '', minHeight: '' });
    };

    target.addEventListener('error', handleError);
    target.addEventListener('load', handleLoad);

    Object.assign(target.style, { cursor: 'wait', minHeight: `${target.height}px` });
    target.src = images[0];
  };

  main();

})();
