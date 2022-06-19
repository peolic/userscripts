// ==UserScript==
// @name        CumLouder
// @author      peolic
// @version     1.2
// @description Add site logo and name to video pages. May not work for all videos.
// @namespace   https://github.com/peolic
// @include     https://www.cumlouder.com/*
// @grant       GM.addStyle
// @homepageURL https://github.com/peolic/userscripts
// @downloadURL https://raw.githubusercontent.com/peolic/userscripts/main/cumlouder.user.js
// @updateURL   https://raw.githubusercontent.com/peolic/userscripts/main/cumlouder.user.js
// ==/UserScript==

//@ts-check
(() => {
  /**
   * @typedef SiteInfo
   * @property {string} name
   * @property {string} logo
   * @property {string} [slug]
   */
  /** @type {{ [codeName: string]: SiteInfo }} */
  const SITE_MAP = {
    UNK: { name: 'Unknown Site', logo: '' },
    recopilatorios: { name: 'Compilations', logo: '' }, // (not a site)

    // https://www.cumlouder.com/sites/
    amateur: { name: 'Amateur', logo: 'amateur.png', slug: 'amateur' },
    chicasmalas: { name: 'Boldly Girls', logo: 'boldlygirls.png', slug: 'boldlygirls' },
    culosenpublico: { name: 'Latin Asses in Public', logo: 'latinassesinpublic.png', slug: 'latinassesinpublic' },
    cumextreme: { name: 'Cum Extreme', logo: 'cumextreme.png', slug: 'cumextreme' },
    diosasdelapaja: { name: 'Handjob Goddess', logo: 'handjobgoddess.png', slug: 'handjobgoddess' },
    domingas: { name: 'Boob Day', logo: 'boobday.png', slug: 'boobday' },
    dulces18: { name: 'Sweet 18', logo: '18años.png', slug: 'sweet-18' },
    exnovias: { name: 'Ex-Girlfriends', logo: 'exgirlfriends.png', slug: 'ex-girlfriends' },
    follovolumen: { name: 'Fuckin Van', logo: 'fuckinvan.png', slug: 'fuckinvan' },
    giracumlouder: { name: 'Cumlouder Tour', logo: 'cumloudertour.png', slug: 'cumloudertour' },
    mamadasenlacalle: { name: 'Street Suckers', logo: 'streetsuckers.png', slug: 'streetsuckers' },
    mecorroentucara: { name: 'Give Me Spunk', logo: 'givemespunk.png', slug: 'givemespunk' },
    melotrago: { name: 'Hungry Cum Eaters', logo: 'hungrycumeaters.png', slug: 'hungrycumeaters' },
    nachovidal: { name: 'Ready or not... Here I Cum', logo: 'nacho-vidal-cumlouder.png', slug: 'ready-or-not-here-i-cum' },
    parodiasdelporno: { name: 'Spoof Porn', logo: 'spoofporn.png', slug: 'spoofporn' },
    pilladas: { name: 'Pornstar Fisher', logo: 'pornstarfisher.png', slug: 'pornstarfisher' },
    pollasxl: { name: 'Cocks XL', logo: 'cocksxl.png', slug: 'cocksxl' },
    heroesdelporno: { name: 'Porns Heros', logo: 'pornsheros.png', slug: 'pornsheros' },
    pov: { name: 'POV', logo: 'pov.png', slug: 'pov' },
    reventandoculos: { name: 'Breaking Asses', logo: 'breakingasses.png', slug: 'breakingasses' },
    seraszorra: { name: 'Bitch Confessions', logo: 'bitchconfessions.png', slug: 'bitchconfessions' },
    siemprejodiendo: { name: 'Cum Trick', logo: 'cumtrick.png', slug: 'cumtrick' },
    soloculazos: { name: 'Stunning Butts', logo: 'stunningbutts.png', slug: 'stunningbutts' },
    viviendoconleyla: { name: 'Living With Leyla', logo: 'livingwithleyla.png', slug: 'livingwithleyla' },
    viviendoconunapornostar: { name: 'Living With a Pornstar', logo: 'livingwithapornstar.png', slug: 'livingwithapornstar' },

    // Series - https://www.cumlouder.com/series/
    autoescuela: { name: 'Cumlouder Driving School', logo: '', slug: 'cumlouder-driving-school' },
    blablacum: { name: 'Bla Bla Cum', logo: '', slug: 'blablacum' },
    cumcash: { name: 'Cum Cash', logo: '', slug: 'cumcash' },
    fuckingroom: { name: 'The Fucking Room', logo: '', slug: 'the-fucking-room' },
    fuckingclinic: { name: 'The Fucking Clinic', logo: '', slug: 'the-fucking-clinic' },
  };

  /**
   * @param {string} [imgUrl]
   * @returns {{ siteName?: string; code?: string; }}
   */
  const parse = (imgUrl) =>
    // https://im0.imgcm.com/img-cumlouder-all/reventandoculos/rc05/pics/previewhd.jpg
    imgUrl?.match(/\/img-cumlouder-all\/(?<siteName>.+?)\/((?<code>[a-z]{2,}\d{2,})\/)?/)?.groups || {};

  function videoPage() {
    //@ts-expect-error
    GM.addStyle(`
.video-page-site {
  float: right;
  text-align: center;
  line-height: 1rem;
  border-left: 1px solid #cac8c8;
  margin: 20px 0 0 6px;
  padding: 6px 6px 10px;
}
.video-page-site-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
}
    `);
    /** @type {HTMLParagraphElement | null} */
    const description = (document.querySelector('.sub-video > .content > p'));
    if (!description)
      return console.error('unable to find video description element');

    /** @type {HTMLLinkElement | null} */
    const imgURL = (document.querySelector('link[as="image"][href*="/img-cumlouder-all/"]'));
    const { siteName, code } = parse(imgURL?.href);

    const data = SITE_MAP[siteName || 'UNK'];

    const siteInfo = document.createElement('div');
    siteInfo.className = 'video-page-site';

    if (data?.logo) {
      const siteLogo = document.createElement('img');
      siteLogo.src = 'https://im0.imgcm.com/img-sites/logo-' + data?.logo;
      siteLogo.alt = `Logo of ${data?.name || siteName}`;
      siteInfo.append(siteLogo);
    }

    const siteInfoName = document.createElement('a');
    siteInfoName.className = 'video-page-site-name';
    siteInfoName.innerText = data?.name || siteName || '?';
    if (data?.slug) {
      siteInfoName.href = `/site/${data.slug}`;
    }
    siteInfo.append(siteInfoName);

    if (data?.name && siteName) {
      const codeName = document.createElement('div');
      codeName.innerText = ` (${siteName})`;
      siteInfo.append(codeName);
    }

    if (code) {
      const siteInfoCode = document.createElement('div');
      const label = document.createElement('strong');
      label.innerText = 'Release:';
      siteInfoCode.append(label, ' ', code);
      siteInfo.append(siteInfoCode);
    }

    description.before(siteInfo);
  }

  function videoCards() {
    //@ts-expect-error
    GM.addStyle(`
.video-card-site-name {
  float: right;
  margin: 8px 0px 0px;
  padding: 0px 10px;
  color: rgb(136, 136, 136);
  line-height: 1rem;
  font-size: 12px;
  max-width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
    `);

    Array.from(document.querySelectorAll('a.muestra-escena')).forEach((card) => {
      const imgURL = card.querySelector('img')?.dataset?.src;
      const { siteName } = parse(imgURL);
      if (!siteName) return;

      const data = SITE_MAP[siteName];
      const siteInfo = document.createElement('div');
      siteInfo.className = 'video-card-site-name';
      siteInfo.innerText = data?.name || siteName;
      const title = card.querySelector('h2');
      if (!title)
        return console.error('unable to find video card title element', card);
      title.after(siteInfo);
    });
  }

  if (document.querySelector('video'))
    videoPage();

  videoCards();

})();
