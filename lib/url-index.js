/**
 * PORTFOLIO VERSION -- url-index.js
 *
 * This module turns a flat list of "landing page" URLs into a lookup index:
 * given a base topic slug, it returns every city/region-specific page that
 * exists for that topic, so the content generator can paste a real, working
 * city table into the page instead of guessing city names.
 *
 * The production version reads two CSV files containing several thousand real
 * platform URLs (the platform's actual page inventory across two countries).
 * That inventory is itself proprietary — it reveals the platform's content
 * coverage and structure — so this portfolio version replaces the CSV read
 * with a small embedded seed list of fictional URLs on a fictional domain.
 * Every parsing function below (parseUrl, indexRows, buildIndex,
 * lookupCityUrls, getAnchorPrefix, getDisplayName) is the real, unmodified
 * algorithm — it is generic URL-slug parsing logic with no proprietary
 * content of its own.
 */

const SEED_URLS = {
  au: [
    'https://au.your-platform.com/software-engineering-internships-in-sydney-australia',
    'https://au.your-platform.com/software-engineering-internships-in-melbourne-australia',
    'https://au.your-platform.com/software-engineering-internships-in-brisbane-australia',
    'https://au.your-platform.com/software-engineering-internships-in-perth-australia',
    'https://au.your-platform.com/software-engineering-internships-in-new-south-wales-australia',
    'https://au.your-platform.com/software-engineering-internships-in-victoria-australia',
    'https://au.your-platform.com/software-engineering-internships-australia',
    'https://au.your-platform.com/marketing-graduate-jobs-in-sydney-australia',
    'https://au.your-platform.com/marketing-graduate-jobs-in-melbourne-australia',
    'https://au.your-platform.com/marketing-graduate-jobs-programs-australia',
  ],
  nz: [
    'https://nz.your-platform.com/software-engineering-internships-in-auckland-new-zealand',
    'https://nz.your-platform.com/software-engineering-internships-in-wellington-new-zealand',
    'https://nz.your-platform.com/software-engineering-internships-in-christchurch-new-zealand',
    'https://nz.your-platform.com/software-engineering-internships-new-zealand',
    'https://nz.your-platform.com/marketing-graduate-jobs-in-auckland-new-zealand',
    'https://nz.your-platform.com/marketing-graduate-jobs-programs-new-zealand',
  ]
};

const urlIndex = { au: {}, nz: {} };
let logs = [];

const AU_CITY_DISPLAY = {
  'new-south-wales-nsw': 'New South Wales',
  'victoria-vic': 'Victoria',
  'queensland-qld': 'Queensland',
  'western-australia-wa': 'Western Australia',
  'south-australia-sa': 'South Australia',
  'northern-territory-nt': 'Northern Territory',
  'tasmania-tas': 'Tasmania',
  'canberra-act': 'Canberra',
  'australian-capital-territory': 'Australian Capital Territory',
  'australian-capital-territory-act': 'Australian Capital Territory',
  'south-australia': 'South Australia',
  'western-australia': 'Western Australia',
  'new-south-wales': 'New South Wales',
  'victoria': 'Victoria',
  'queensland': 'Queensland',
  'northern-territory': 'Northern Territory',
  'tasmania': 'Tasmania',
};

const NZ_CITY_DISPLAY = {
  'bay-of-plenty': 'Bay of Plenty',
  'hawkes-bay': "Hawke's Bay",
  'manawatu-wanganui': 'Manawatu-Wanganui',
  'west-coast': 'West Coast',
  'palmerston-north': 'Palmerston North',
  'new-plymouth': 'New Plymouth',
};

const AU_KNOWN_CITY_SLUGS = [...new Set([
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'darwin', 'hobart',
  'canberra', 'canberra-act',
  'new-south-wales', 'new-south-wales-nsw',
  'victoria', 'victoria-vic',
  'queensland', 'queensland-qld',
  'western-australia', 'western-australia-wa',
  'south-australia', 'south-australia-sa',
  'northern-territory', 'northern-territory-nt',
  'tasmania', 'tasmania-tas',
  'australian-capital-territory',
])].sort((a, b) => b.length - a.length);

const NZ_KNOWN_CITY_SLUGS = [...new Set([
  'auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga', 'napier',
  'hastings', 'dunedin', 'palmerston-north', 'nelson', 'rotorua', 'new-plymouth',
  'whangarei', 'invercargill', 'whanganui', 'gisborne', 'porirua', 'upper-hutt',
  'lower-hutt', 'auckland-region', 'bay-of-plenty', 'canterbury', 'hawkes-bay',
  'manawatu-wanganui', 'marlborough', 'northland', 'otago', 'southland',
  'taranaki', 'tasman', 'waikato', 'west-coast',
])].sort((a, b) => b.length - a.length);

function matchKnownCitySuffix(slug, country) {
  const list = country === 'AU' ? AU_KNOWN_CITY_SLUGS : NZ_KNOWN_CITY_SLUGS;
  for (const city of list) {
    const suffix = `-${city}`;
    if (slug.length > suffix.length && slug.endsWith(suffix)) {
      return { baseSlug: slug.slice(0, -suffix.length), citySlug: city };
    }
  }
  return null;
}

function resolveCitySlugCandidate(raw, countrySuffix, knownList) {
  if (knownList.includes(raw)) return raw;
  const bareCountryName = countrySuffix.startsWith('-') ? countrySuffix.slice(1) : countrySuffix;
  if (raw === bareCountryName) return null;
  if (raw.endsWith(countrySuffix) && raw.length > countrySuffix.length) {
    const stripped = raw.slice(0, -countrySuffix.length);
    if (stripped) return stripped;
  }
  return raw;
}

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getDisplayName(citySlug, country) {
  const map = country === 'AU' ? AU_CITY_DISPLAY : NZ_CITY_DISPLAY;
  if (map[citySlug]) return map[citySlug];
  return titleCaseSlug(citySlug);
}

function parseUrl(fullUrl, country) {
  const isAU = country === 'AU';
  const domainPrefix = isAU ? 'https://au.your-platform.com/' : 'https://nz.your-platform.com/';
  const countrySuffix = isAU ? '-australia' : '-new-zealand';
  const knownList = isAU ? AU_KNOWN_CITY_SLUGS : NZ_KNOWN_CITY_SLUGS;

  if (typeof fullUrl !== 'string') return null;
  let slug = fullUrl.trim().replace(/\/+$/, '').toLowerCase();
  if (!slug.startsWith(domainPrefix)) return null;
  slug = slug.slice(domainPrefix.length);
  if (!slug) return null;

  const idx = slug.lastIndexOf('-in-');
  if (idx !== -1) {
    const baseSlug = slug.slice(0, idx);
    const citySlugRaw = slug.slice(idx + 4);
    if (baseSlug && citySlugRaw) {
      const citySlug = resolveCitySlugCandidate(citySlugRaw, countrySuffix, knownList);
      if (citySlug) return { baseSlug, citySlug, isCityPage: true, pattern: 1 };
    }
  }

  const rawMatch = matchKnownCitySuffix(slug, isAU ? 'AU' : 'NZ');
  if (rawMatch && rawMatch.baseSlug) {
    return { baseSlug: rawMatch.baseSlug, citySlug: rawMatch.citySlug, isCityPage: true, pattern: 2 };
  }

  let strippedSlug = slug;
  if (strippedSlug.endsWith(countrySuffix) && strippedSlug.length > countrySuffix.length) {
    strippedSlug = strippedSlug.slice(0, -countrySuffix.length);
  }
  if (!strippedSlug) return null;

  const match = matchKnownCitySuffix(strippedSlug, isAU ? 'AU' : 'NZ');
  if (match && match.baseSlug) {
    return { baseSlug: match.baseSlug, citySlug: match.citySlug, isCityPage: true, pattern: 2 };
  }

  return { baseSlug: strippedSlug, citySlug: null, isCityPage: false };
}

function indexRows(urls, country, indexObj) {
  const citySlugMap = {};

  for (const url of urls) {
    if (!url || typeof url !== 'string' || !url.trim()) continue;
    let parsed;
    try {
      parsed = parseUrl(url, country);
    } catch {
      continue;
    }
    if (!parsed || !parsed.isCityPage) continue;

    const normalizedUrl = url.trim().replace(/\/+$/, '');
    if (!citySlugMap[parsed.baseSlug]) citySlugMap[parsed.baseSlug] = new Map();
    const cityMap = citySlugMap[parsed.baseSlug];
    const existing = cityMap.get(parsed.citySlug);
    if (!existing || normalizedUrl.length > existing.length) {
      cityMap.set(parsed.citySlug, normalizedUrl);
    }
  }

  for (const [baseSlug, cityMap] of Object.entries(citySlugMap)) {
    indexObj[baseSlug] = [...cityMap.values()];
  }
}

function buildIndex() {
  logs = [];
  urlIndex.au = {};
  urlIndex.nz = {};

  indexRows(SEED_URLS.au, 'AU', urlIndex.au);
  indexRows(SEED_URLS.nz, 'NZ', urlIndex.nz);

  const auTotal = Object.values(urlIndex.au).reduce((sum, arr) => sum + arr.length, 0);
  const nzTotal = Object.values(urlIndex.nz).reduce((sum, arr) => sum + arr.length, 0);

  logs.push(`AU URL index built: ${Object.keys(urlIndex.au).length} base slugs, ${auTotal} total city page URLs`);
  logs.push(`NZ URL index built: ${Object.keys(urlIndex.nz).length} base slugs, ${nzTotal} total city page URLs`);

  return urlIndex;
}

function getLogs() {
  return logs;
}

function lookupCityUrls(baseSlug, country) {
  const indexObj = country === 'AU' ? urlIndex.au : urlIndex.nz;

  const attempt1 = indexObj[baseSlug];
  if (attempt1 && attempt1.length) {
    console.log(`City pages found: ${attempt1.length} pages for slug ${baseSlug} (attempt 1)`);
    return { urls: attempt1, matchedBaseSlug: baseSlug, attempt: 1 };
  }

  if (baseSlug.endsWith('-in')) {
    const fallbackSlug = baseSlug.slice(0, -'-in'.length);
    const attempt2 = indexObj[fallbackSlug];
    if (attempt2 && attempt2.length) {
      console.log(`City pages found: ${attempt2.length} pages for slug ${baseSlug} (attempt 2)`);
      return { urls: attempt2, matchedBaseSlug: fallbackSlug, attempt: 2 };
    }
  }

  if (baseSlug.endsWith('-programs')) {
    const strippedSlug = baseSlug.slice(0, -'-programs'.length);
    const attempt3 = indexObj[strippedSlug];
    if (attempt3 && attempt3.length) {
      console.log(`City pages found: ${attempt3.length} pages for slug ${baseSlug} (attempt 3)`);
      return { urls: attempt3, matchedBaseSlug: baseSlug, attempt: 3 };
    }
  }

  if (baseSlug.startsWith('management-')) {
    const strippedSlug = baseSlug.slice('management-'.length);
    const attempt4 = indexObj[strippedSlug];
    if (attempt4 && attempt4.length) {
      console.log(`City pages found: ${attempt4.length} pages for slug ${baseSlug} (attempt 4)`);
      return { urls: attempt4, matchedBaseSlug: baseSlug, attempt: 4 };
    }
  }

  return { urls: [], matchedBaseSlug: baseSlug, attempt: 0 };
}

function getAnchorPrefix(baseSlug) {
  if (baseSlug.startsWith('entry-level-')) {
    let topic = baseSlug.slice('entry-level-'.length);
    if (topic.endsWith('-jobs-programs')) topic = topic.slice(0, -'-jobs-programs'.length);
    else if (topic.endsWith('-jobs')) topic = topic.slice(0, -'-jobs'.length);
    return `Entry Level ${titleCaseSlug(topic)} Jobs & Programs`;
  }

  if (baseSlug.includes('graduate-jobs-programs') || baseSlug.includes('graduate-jobs')) {
    const hasPrograms = baseSlug.includes('graduate-jobs-programs');
    const marker = hasPrograms ? '-graduate-jobs-programs' : '-graduate-jobs';
    const suffixOnly = hasPrograms ? 'graduate-jobs-programs' : 'graduate-jobs';
    const idx = baseSlug.indexOf(marker);
    const topic = idx >= 0 ? baseSlug.slice(0, idx) : baseSlug.replace(suffixOnly, '').replace(/-+$/, '');
    return `${titleCaseSlug(topic)} Graduate Jobs & Programs`;
  }

  if (baseSlug.endsWith('-internships')) {
    const topic = baseSlug.slice(0, -'-internships'.length);
    return `${titleCaseSlug(topic)} Internships`;
  }

  return titleCaseSlug(baseSlug);
}

module.exports = { urlIndex, buildIndex, getDisplayName, getAnchorPrefix, getLogs, parseUrl, lookupCityUrls };
