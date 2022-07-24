// ==UserScript==
// @name        Gamma Entertainment - Scene Length
// @author      peolic
// @version     1.0
// @description Add scene length information on Gamma Entertainment sites
// @icon        https://www.gammaentertainment.com/images/logo_gammae.png
// @namespace   https://github.com/peolic
// @match       https://*.wicked.com/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/gamma-ent.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/gamma-ent.user.js
// ==/UserScript==

(async () => {
  async function main() {
    singleScene();
    sceneThumbs();
  }

  async function singleScene() {
    const sceneHeader = await elementReadyIn('.ScenePlayerHeaderDesktop-Container', 5000);
    if (!sceneHeader)
      return;

    const data = getReactFiber(sceneHeader)?.return?.return?.return?.return?.memoizedProps?.scene;
    if (!data) throw new Error('failed to get fiber');

    const date = sceneHeader.querySelector('.ScenePlayerHeaderDesktop-Date-Text');
    const length = date.cloneNode(true);
    const sep = (date.previousElementSibling || date.nextElementSibling).cloneNode(true);
    length.innerText = `⏱ ${data.length}`;
    length.title = data.length;
    date.after(sep, length);
  }

  async function sceneThumbs() {
    if (!await elementReadyIn('.SceneThumb-Default'))
      return;

    document.querySelectorAll('.SceneThumb-Default').forEach((sceneThumb) => {
      const data = getReactFiber(sceneThumb)?.child?.child?.memoizedProps?.scene;
      if (!data) throw new Error('failed to get fiber');

      const date = sceneThumb.querySelector('.SceneDetail-DatePublished-Text');
      const length = date.cloneNode(true);
      length.innerText = `⏱ ${data.length}`;
      length.title = data.length;
      date.before(length);
    });
  }

  // MIT Licensed
  // Author: jwilson8767
  // https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
  /**
   * Waits for an element satisfying selector to exist, then resolves promise with the element.
   * Useful for resolving race conditions.
   *
   * @param {string} selector
   * @param {HTMLElement} [parentEl]
   * @returns {Promise<Element>}
   */
  function elementReady(selector, parentEl) {
    return new Promise((resolve, reject) => {
      let el = (parentEl || document).querySelector(selector);
      if (el) {resolve(el);}
      new MutationObserver((mutationRecords, observer) => {
        // Query for elements matching the specified selector
        Array.from((parentEl || document).querySelectorAll(selector)).forEach((element) => {
          resolve(element);
          //Once we have resolved we don't need the observer anymore.
          observer.disconnect();
        });
      })
      .observe(parentEl || document.documentElement, {
        childList: true,
        subtree: true
      });
    });
  }

  const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * @param {string} selector
   * @param {number} [timeout] fail after, in milliseconds
   * @param {HTMLElement} [parentEl]
   */
  const elementReadyIn = (selector, timeout, parentEl) => {
    const promises = [elementReady(selector, parentEl)];
    if (timeout) promises.push(wait(timeout).then(() => null));
    return Promise.race(promises);
  };

  /**
   * @param {Element} el
   * @returns {Record<string, any> | undefined}
   */
  const getReactFiber = (el) =>
    //@ts-expect-error
    el[Object.getOwnPropertyNames(el).find((p) => p.startsWith('__reactFiber$'))];

  await main();
})();
