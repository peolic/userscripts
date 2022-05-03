// ==UserScript==
// @name        Porn Pros
// @author      peolic
// @version     1.3
// @description Fix duration on Porn Pros sites
// @icon        https://i.ibb.co/KjtvXWX/network.png
// @namespace   https://github.com/peolic
// @include     https://pornpros.com/video/*
// @include     https://pornprosnetwork.com/video/*
// @include     https://passion-hd.com/video/*
// @include     https://puremature.com/video/*
// @include     https://povd.com/video/*
// @include     https://castingcouch-x.com/video/*
// @include     https://tiny4k.com/video/*
// @include     https://fantasyhd.com/video/*
// @include     https://exotic4k.com/video/*
// @include     https://lubed.com/video/*
// @include     https://holed.com/video/*
// @include     https://spyfam.com/video/*
// @include     https://nannyspy.com/video/*
// @include     https://bbcpie.com/video/*
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

  function apply() {
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

  apply();

})();
