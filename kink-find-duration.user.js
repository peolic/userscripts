// ==UserScript==
// @name        Kink - Find Duration
// @author      peolic
// @version     1.01
// @description Add "find duration" link to shoot pages
// @icon        https://www.kink.com/favicon-32x32.png
// @namespace   https://github.com/peolic
// @include     https://www.kink.com/shoot/*
// @grant       GM.addStyle
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/kink-find-duration.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/kink-find-duration.user.js
// ==/UserScript==

(() => {
  const shootTitle = document.querySelector('h1');

  const makeSearchURL = () => {
    const searchParams = new URLSearchParams({
      type: 'shoots',
      q: `"${shootTitle.firstChild.textContent.trim()}"`,
      channelIds: document.querySelector('.shoot-page').dataset.sitename,
      publishedYears: document.querySelector('.shoot-date').innerText.match(/, (\d+)$/)[1],
      sort: 'published',
    });
    document.querySelectorAll('.starring a').forEach((performer) => {
      searchParams.append('performerIds', performer.href.match(/\/model\/(\d+)\//)[1]);
    });
    return 'https://www.kink.com/search?' + searchParams.toString();
  };

  GM.addStyle(`
#find-duration {
  margin-bottom: 15px;
}

#find-duration::before {
  content: "\\e819";
  font-family: kink-video;
  margin-right: 5px;
  color: #fff;
}
`);

  const findDuration = document.createElement('a');
  findDuration.id = 'find-duration';
  findDuration.innerText = 'Find duration';
  findDuration.href = makeSearchURL();

  shootTitle.after(findDuration);

})();
