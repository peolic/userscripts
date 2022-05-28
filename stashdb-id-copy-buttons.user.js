// ==UserScript==
// @name        StashDB ID Copy Buttons
// @author      peolic
// @version     1.3
// @description Adds copy ID buttons to StashDB
// @namespace   https://github.com/peolic
// @include     https://stashdb.org/*
// @grant       GM.setClipboard
// @grant       GM.addStyle
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/stashdb-id-copy-buttons.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/stashdb-id-copy-buttons.user.js
// ==/UserScript==

//@ts-check
(() => {
  function main() {
    //@ts-expect-error
    GM.addStyle(`
button.injected-copy-id {
    color: #212529;
    background-color: #f8f9fa;
    border-color: #f8f9fa;
}

button.injected-copy-id:focus {
    box-shadow: 0 0 0 .2rem rgba(216,217,219,.5);
}
`);

    dispatcher();
    window.addEventListener(locationChanged, dispatcher);
  }

  function splitLocation(loc=undefined) {
    if (loc === undefined) loc = window.location;
    else loc = new URL(loc);
    const pathname = loc.pathname.replace(/^\//, '');
    return pathname ? pathname.split(/\//g) : [];
  }

  async function dispatcher() {
    await elementReadyIn('#root nav + div > .LoadingIndicator', 100);

    const pathParts = splitLocation();

    if (pathParts.length === 0) return;
    const [p1, p2, p3] = pathParts;

    if (['performers', 'scenes', 'studios', 'tags'].includes(p1) && p2 && !p3) {
      return await injectButton(p1);
    }

    if (p1 === 'search') {
      return await injectSearchButtons();
    }
  }

  function makeCopyIDButton(margin=true, uuidGetter=undefined) {
    if (uuidGetter === undefined) uuidGetter = () => splitLocation()[1];
    const button = document.createElement('button');
    button.type = 'button';
    if (margin)
      button.style.margin = '2px';
    button.classList.add('btn', 'btn-light', 'injected-copy-id');
    button.textContent = '📋';
    button.title = 'Copy ID';
    button.addEventListener('mouseover', (e) => {
      button.title = !e.ctrlKey
        ? `Copy ID:\n${uuidGetter(e)}\nHold CTRL to copy as Markdown link.`
        : `Copy link as Markdown:\n${uuidGetter(e)}`;
    });
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      //@ts-expect-error
      GM.setClipboard(uuidGetter(e));
      button.textContent = '✔';
      setStyles(button, { backgroundColor: 'yellow', fontWeight: '800' });
      setTimeout(() => {
        button.textContent = '📋';
        setStyles(button, { backgroundColor: '', fontWeight: '' });
      }, 2500);
    });
    return button;
  };

  async function injectButton(object) {
    if (object === 'performers') {
      const performerInfo = await elementReadyIn('.PerformerInfo', 2000);
      let target = performerInfo.querySelector('.PerformerInfo-actions');
      if (!target || target.querySelector('button.injected-copy-id')) {
        return;
      }
      try {
        const button = makeCopyIDButton(false, (e) => {
          const [object, ident] = splitLocation();
          if (!e?.ctrlKey) return ident;
          const performerName =
            /** @type {HTMLElement[]} */
            (Array.from(performerInfo.querySelectorAll('h3 > span, h3 > small')))
              .map(e => e.innerText).join(' ');
          return `[${performerName}](/${object}/${ident})`;
        });
        let container = target.querySelector(':scope .text-end');
        if (container) {
          // We have buttons, add to them
          button.classList.add('ms-2');
        } else {
          // TODO: FIX
          container = document.createElement('div');
          container.classList.add('text-end');
          target.prepend(container);
        }
        container.appendChild(button);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    if (object === 'scenes') {
      const sceneInfo = await elementReadyIn('.scene-info', 2000);
      const target = sceneInfo?.querySelector('.card-header > .float-end');
      if (!target || target.querySelector('button.injected-copy-id')) {
        return;
      }
      try {
        const button = makeCopyIDButton(false, (e) => {
          const [object, ident] = splitLocation();
          if (!e?.ctrlKey) return ident;
          const sceneTitle = 
            /** @type {HTMLElement[]} */
            ([sceneInfo.querySelector('h6 > a'), sceneInfo.querySelector('h3 > span')])
              .map(e => e.innerText).join(' \u{2013} ');
          return `[${sceneTitle}](/${object}/${ident})`;
        });
        button.classList.add('ms-2');
        target.appendChild(button);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    if (object === 'studios') {
      await elementReadyIn('.studio-title', 2000);
      const target = document.querySelector('.studio-title ~ div:not([class])');
      if (!target || target.querySelector('button.injected-copy-id')) {
        return;
      }
      try {
        const button = makeCopyIDButton(true, (e) => {
          const [object, ident] = splitLocation();
          if (!e?.ctrlKey) return ident;
          const studioName = document.querySelector('.studio-title h3').textContent.trim();
          return `[${studioName}](/${object}/${ident})`;
        });
        button.classList.add('ms-2');
        target.appendChild(button);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    if (object === 'tags') {
      const target = await elementReadyIn('h3 + div.ms-auto', 2000);
      if (!target || target.querySelector('button.injected-copy-id')) {
        return;
      }
      try {
        const button = makeCopyIDButton(false, (e) => {
          const [object, ident] = splitLocation();
          if (!e?.ctrlKey) return ident;
          const tagName = document.querySelector('h3 > em').textContent.trim();
          return `[${tagName}](/${object}/${ident})`;
        });
        button.classList.add('ms-2');
        target.appendChild(button);
      } catch (error) {
        console.error(error);
      }
      return;
    }
  } // injectButton

  async function injectSearchButtons() {
    const selectors = ['.SearchPage-scene', '.SearchPage-performer'];
    const ready = await Promise.race([
      selectors.map(selector => elementReady(selector)),
      wait(2000).then(() => null),
    ]);
    if (ready === null) {
      console.debug('no search results');
      return;
    }
    await wait(0);

    await elementReadyIn('.MainContent > .LoadingIndicator', 200);
    let targets = (
      /** @type {HTMLAnchorElement[]} */
      (Array.from(
        document.querySelectorAll(selectors.join(', '))
      ))
    );
    if (targets.length === 0) {
      return;
    }
    for (let targetLink of targets) {
      const target = /** @type {HTMLDivElement} */ (targetLink.querySelector(':scope > .card'));
      if (target.querySelector(':scope > button.injected-copy-id')) continue;
      try {
        const uuidGetter = () => splitLocation(targetLink.href)[1];
        const button = makeCopyIDButton(false, uuidGetter);
        button.classList.replace('btn', 'btn-sm');
        setStyles(button, {
          position: 'relative',
          fontSize: '0.8em',
          padding: '.25em .25em',
          marginLeft: 'auto',
          height: '2.4em',
        });
        target.insertAdjacentElement('beforeend', button);
      } catch (error) {
        console.error(error);
      }
    }
  } // injectSearchButtons

  /**
   * @param {number} ms
   */
  const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * @param {string} selector
   * @param {number} [timeout] fail after, in milliseconds
   */
  const elementReadyIn = (selector, timeout) => {
    const promises = [elementReady(selector)];
    if (timeout) promises.push(wait(timeout).then(() => null));
    return Promise.race(promises);
  };

  /**
   * @template {HTMLElement | SVGSVGElement} E
   * @param {E} el
   * @param {Partial<CSSStyleDeclaration>} styles
   * @returns {E}
   */
   function setStyles(el, styles) {
    Object.assign(el.style, styles);
    return el;
  }

  // Based on: https://dirask.com/posts/JavaScript-on-location-changed-event-on-url-changed-event-DKeyZj
  const locationChanged = (function() {
    const { pushState, replaceState } = history;

    // @ts-expect-error
    const prefix = GM.info.script.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-');

    const eventLocationChange = new Event(`${prefix}$locationchange`);

    history.pushState = function(...args) {
      pushState.apply(history, args);
      window.dispatchEvent(new Event(`${prefix}$pushstate`));
      window.dispatchEvent(eventLocationChange);
    }

    history.replaceState = function(...args) {
      replaceState.apply(history, args);
      window.dispatchEvent(new Event(`${prefix}$replacestate`));
      window.dispatchEvent(eventLocationChange);
    }

    window.addEventListener('popstate', function() {
      window.dispatchEvent(eventLocationChange);
    });

    return eventLocationChange.type;
  })();

  // MIT Licensed
  // Author: jwilson8767
  // https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
  /**
   * Waits for an element satisfying selector to exist, then resolves promise with the element.
   * Useful for resolving race conditions.
   *
   * @param {string} selector
   * @returns {Promise<Element>}
   */
  function elementReady(selector) {
    return new Promise((resolve, reject) => {
      let el = document.querySelector(selector);
      if (el) {resolve(el);}
      new MutationObserver((mutationRecords, observer) => {
        // Query for elements matching the specified selector
        Array.from(document.querySelectorAll(selector)).forEach((element) => {
          resolve(element);
          //Once we have resolved we don't need the observer anymore.
          observer.disconnect();
        });
      })
      .observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    });
  }

  main();
})();
