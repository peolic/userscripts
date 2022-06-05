// ==UserScript==
// @name        Porn Pros
// @author      peolic
// @version     2.0
// @description Fix duration on Porn Pros sites
// @icon        https://i.ibb.co/KjtvXWX/network.png
// @namespace   https://github.com/peolic
// @match       https://pornpros.com/*
// @match       https://pornprosnetwork.com/*
// @match       https://passion-hd.com/*
// @match       https://puremature.com/*
// @match       https://povd.com/*
// @match       https://castingcouch-x.com/*
// @match       https://tiny4k.com/*
// @match       https://fantasyhd.com/*
// @match       https://exotic4k.com/*
// @match       https://lubed.com/*
// @match       https://holed.com/*
// @match       https://spyfam.com/*
// @match       https://nannyspy.com/*
// @match       https://bbcpie.com/*
// @match       https://myveryfirsttime.com/*
// @grant       none
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/porn-pros.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/porn-pros.user.js
// ==/UserScript==

(() => {
  const makeQuickSelect = (text) => {
    const b = document.createElement('b');
    b.style.userSelect = 'all';
    b.innerText = text;
    return b;
  };

  const makeISODateElement = (date) => {
    const isoDate = new Date(`${date} 0:00 UTC`).toISOString().slice(0, 10);
    return makeQuickSelect(isoDate);
  };

  function videoPage() {
    const infoContainer = document.querySelector('div[id$="-stime"]');
    if (!infoContainer || infoContainer.dataset.injected) return;
    infoContainer.dataset.injected = 'true';

    const getInfoElement = (caption) => {
      for (const el of infoContainer.querySelectorAll(':scope > div > span')) {
        if (el.previousSibling.textContent.trim() === `${caption}:`) {
          return el;
        }
      }
    };

    const applyDuration = () => {
      const durationElement = getInfoElement('DURATION');
      const duration = parseInt(durationElement.innerText.replace(/^(\d+) minutes$/, '$1'), 10);
      if (!duration) return;
      // bad:			( ( (minutes * 60 + seconds) / 60 ) * 1000 ).toFixed(0)
      // reverse: ((v / 1000) * 60)
      const totalSeconds = (duration / 1000) * 60;
      const minutes = parseInt(totalSeconds / 60, 10);
      const seconds = parseInt(totalSeconds % 60, 10);
      const paddedSeconds = seconds.toString().padStart(2, '0');
      if (duration >= 120) {
        const correct = makeQuickSelect(`${minutes}:${paddedSeconds}`);
        correct.style.marginRight = '.25rem';
        durationElement.insertAdjacentElement('beforebegin', correct);
        durationElement.innerText = `(extracted from ${duration})`;
        durationElement.title = totalSeconds;
      } else if (seconds >= 10) {
        const possiblyCorrect = document.createElement('span');
        possiblyCorrect.style.marginLeft = '.25rem';
        possiblyCorrect.innerText = `(possibly ${minutes}:${paddedSeconds})`;
        durationElement.appendChild(possiblyCorrect);
        durationElement.title = totalSeconds;
      }
    };

    const applyReleaseDate = () => {
      const releaseElement = getInfoElement('RELEASED');
      if (releaseElement) {
        const parent = releaseElement.parentElement;
        const date = makeISODateElement(releaseElement.innerText);
        releaseElement.style.marginLeft = '.25rem';
        releaseElement.innerText = `(${releaseElement.innerText})`;
        parent.append(date, releaseElement);
      }
    };

    applyDuration();
    applyReleaseDate();
  }

  const addDateToVideoCards = () => {
    Array.from(document.querySelectorAll('.video-releases-list .card')).forEach((card) => {
      /** @type {HTMLDivElement} */
      const information = card.querySelector('.card-body .information');
      /** @type {HTMLElement} */
      let dateEl = information.querySelector(':scope > p.date');
      if (!dateEl) {
        const { date } = card.dataset;
        if (!date)
          return;

        dateEl = document.createElement('p');
        dateEl.classList.add('date');
        dateEl.innerText = date;
        information.append(dateEl);
      }

      const isoDate = makeISODateElement(dateEl.innerText);
      isoDate.style.marginRight = '.25rem';
      dateEl.innerText = `(${dateEl.innerText})`;
      dateEl.prepend(isoDate);
    });
  }

  addDateToVideoCards();

  if (/^\/video\/[^/]+/.test(window.location.pathname))
    return videoPage();

})();
