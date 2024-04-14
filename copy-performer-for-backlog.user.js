// ==UserScript==
// @name        StashDB - Copy Performer For Backlog
// @author      peolic
// @version     1.0
// @namespace   https://github.com/peolic
// @match       https://stashdb.org/*
// @grant       GM.addStyle
// @require     https://unpkg.com/clipboard-polyfill@4.0.2/dist/es5/window-var/clipboard-polyfill.window-var.es5.js
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/stashdb-copy-performer-for-backlog.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/stashdb-copy-performer-for-backlog.user.js
// ==/UserScript==

(() => {
  const nativeClipboardAPI = ('clipboard' in navigator) && ('write' in navigator.clipboard) && ('ClipboardItem' in window);
  const polyfillClipboardAPI = ('clipboard' in window);

  function main() {
    //@ts-expect-error
    GM.addStyle(`
button.injected-performer-copy-backlog {
    --bs-btn-padding-x: .645rem;
    margin: 2px;

    /* https://getbootstrap.com/docs/5.2/components/buttons/ */
    --bs-btn-color: #000;
    --bs-btn-bg: #f8f9fa;
    --bs-btn-border-color: #f8f9fa;
    --bs-btn-hover-color: #000;
    --bs-btn-hover-bg: #d3d4d5;
    --bs-btn-hover-border-color: #c6c7c8;
    --bs-btn-focus-shadow-rgb: 211,212,213;
    --bs-btn-active-color: #000;
    --bs-btn-active-bg: #c6c7c8;
    --bs-btn-active-border-color: #babbbc;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #000;
    --bs-btn-disabled-bg: #f8f9fa;
    --bs-btn-disabled-border-color: #f8f9fa;
}

button.injected-copy-id:focus {
    box-shadow: 0 0 0 .2rem rgba(216,217,219,.5);
}
`);

    // ************************
    dispatcher();
    window.addEventListener(locationChanged, dispatcher);
    // ************************
  }

  /** @param {string} [location] */
  function splitLocation(location=undefined) {
    const loc = location === undefined
      ? window.location
      : new URL(location);
    const pathname = loc.pathname.replace(/^\//, '');
    return pathname ? pathname.split(/\//g) : [];
  }

  async function dispatcher() {
    await elementReadyIn('#root nav + div > .LoadingIndicator', 100);

    const pathParts = splitLocation();

    if (pathParts.length === 0) return;
    const [p1, p2, p3] = pathParts;

    if (p1 === 'performers' && p2 && p2 !== 'add' && !p3) {
      const el = await elementReadyIn('.PerformerInfo h3', 2000);

      if (!nativeClipboardAPI && !polyfillClipboardAPI)
        return useCopyEvent();

      useButton();
    }
  }

  function useCopyEvent() {
    // Fallback
    const el = document.querySelector('.PerformerInfo h3');
    el.addEventListener('copy', (event) => {
      const { plainText, html } = makeClipboardData();
      event.clipboardData.setData('text/html', html);
      event.clipboardData.setData('text/plain', plainText);
      event.preventDefault();
    });
    el.title = 'Select performer name, copy (Ctrl+C), then paste clipboard into a cell\non the backlog sheet "performers to split up"';
    Object.assign(el.style, {
      textDecoration: 'underline solid yellow 3px',
      cursor: 'help',
    });
  }

  function useButton() {
    const performerInfo = document.querySelector('.PerformerInfo');
    let target = performerInfo.querySelector('.PerformerInfo-actions');
    if (performerInfo?.querySelector('button.injected-performer-copy-backlog')) {
      return;
    }
    try {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('btn', 'btn-light', 'injected-performer-copy-backlog');
      button.textContent = '✨';
      button.title = 'Copy performer for backlog, then paste clipboard into a cell\non the backlog sheet "Performers To Split Up".';
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        //@ts-expect-error
        await copyUsingClipboardAPI();
        button.textContent = '✔';
        Object.assign(button.style, { backgroundColor: 'yellow', fontWeight: '800' });
        setTimeout(() => {
          button.textContent = '✨';
          Object.assign(button.style, { backgroundColor: '', fontWeight: '' });
        }, 2500);
      });

      let container = target?.querySelector(':scope .text-end');
      if (container) {
        // We have buttons, add to them
        button.classList.add('me-2');
      } else {
        container = document.createElement('div');
        container.classList.add('text-end');
        if (target)
          target.prepend(container);
        else {
          /** @type {HTMLHeadingElement} */
          // @ts-expect-error
          const h3 = (performerInfo.querySelector('h3'));
          h3.classList.add('flex-fill');
          h3.after(container);
        }
      }
      container.prepend(button);
    } catch (error) {
      console.error(error);
    }
  }

  async function copyUsingClipboardAPI() {
    const { plainText, html } = makeClipboardData();
    const itemData = {
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
    };

    if (nativeClipboardAPI) {
      console.debug('performer copied using native');
      await navigator.clipboard.write([
        new window.ClipboardItem(itemData)
      ]);
    } else {
      console.debug('performer copied using polyfill');
      await clipboard.write([
        new clipboard.ClipboardItem(itemData)
      ]);
    }
  };

  /**
   * @returns {{ plainText: string; html: string }}
   */
  const makeClipboardData = () => {
    const performerInfo = document.querySelector('.PerformerInfo');

    const performerName =
      /** @type {HTMLElement[]} */
      (Array.from(performerInfo.querySelectorAll('h3 > span, h3 > small')))
        .map(e => e.innerText).join(' ');


    const links = Array.from(performerInfo.querySelectorAll('.card + .float-end > a')).map((a) => a.href);

    const performerURL = window.location.origin + window.location.pathname;
    const iafd = links.find((url) => url.match(/iafd\.com\/person.rme\/perfid=.+/));
    const ixxx = links.find((url) => url.match(/indexxx\.com\/m\/.+/));

    let note = '- ?';
    // const noteResponse = prompt(`add note?\n\n${performerName}\n[iafd] [ixxx]\n`, note);
    // if (noteResponse) {
    //   note = noteResponse;
    // }

    const plainText = `${performerName} ${performerURL}\n${[iafd, ixxx].map((u) => `[${u}]`).join(' ')}\n${note}`;

    // Google Sheets RichText
    const text = `${performerName}\n[iafd] [ixxx]\n${note}`;
    // data-sheets-hyperlinkruns="{"1":29,"2":"https://www.iafd.com/person.rme/xxx"}{"1":33}{"1":36,"2":"https://www.indexxx.com/m/xxx"}{"1":40}"
    const performerStart = 0;
    const performerEnd = performerStart + performerName.length;
    const iafdStart = text.indexOf('iafd');
    const iafdEnd = iafdStart + 4;
    const ixxxStart = text.indexOf('ixxx');
    const ixxxEnd = ixxxStart + 4;

    const value = encode({"1":2,"2":text});

    const userFormat = encode({"2":1053569,"3":{"1":0},"10":1,"11":4,"12":0,"15":"Arial","23":1});

    const styleRun = (start, end) => [encode({"1":start,"2":{"2":{"1":2,"2":1136076},"9":1}}), encode({"1":end})];
    const textStyleRuns = combine([
      ...styleRun(performerStart, performerEnd),
      ...(iafd ? styleRun(iafdStart, iafdEnd) : []),
      ...(ixxx ? styleRun(ixxxStart, ixxxEnd) : []),
    ]);

    const hyperlinkRun = (start, end, url) => [encode({"1":start,"2":url}), encode({"1":end})];
    const hyperlinkRuns = combine([
      ...hyperlinkRun(performerStart, performerEnd, performerURL),
      ...hyperlinkRun(iafdStart, iafdEnd, iafd),
      ...hyperlinkRun(ixxxStart, ixxxEnd, ixxx),
    ]);

    const html = (
`<style type="text/css"><!--br {mso-data-placement:same-cell;}--></style>
<span data-sheets-root="1" data-sheets-value="${value}" data-sheets-userformat="${userFormat}" data-sheets-textstyleruns="${textStyleRuns}" data-sheets-hyperlinkruns="${hyperlinkRuns}">
<span><a href="${performerURL}">${performerName}</a></span><br/>
<span>[</span><span>${iafd ? `<a href="${iafd}">iafd</a>` : `iafd`}</span><span>] [</span><span>${iafd ? `<a href="${ixxx}">ixxx</a>` : `ixxx`}</span><span>]</span><br/>
<span>- ?</span>
</span>`
    );

    return { plainText, html };
  };

  /**
   * Encode into HTML-escaped JSON
   * @param {Object} obj
   * @returns {string}
   */
  const encode = (obj) => JSON.stringify(obj).replace(/"/g, '&quot;');

  /**
   * Array join using special character EE10
   * @param {string[]} arr
   * @returns {string}
   */
  const combine = (arr) => arr.join('');

  // ====================================

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
    // @ts-expect-error
    if (timeout) promises.push(wait(timeout).then(() => null));
    return Promise.race(promises);
  };

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
  window.addEventListener(locationChanged, main);

})();
