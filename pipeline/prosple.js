/**
 * PORTFOLIO VERSION -- prosple.js
 *
 * This is the platform's own data layer: given a career path and a country,
 * it returns the employer list, salary ranges, salience vocabulary, and city
 * pages that the writer prompt (see pipeline/writer.js) treats as
 * ground truth and is never allowed to improvise.
 *
 * The production version of this file is almost entirely data: roughly 40
 * career paths across two countries, each with a curated employer list, real
 * salary bands sourced from the platform's own data, and a hand-built
 * vocabulary list of the terms a practitioner in that field actually uses.
 * That data is the platform's core commercial asset, so this portfolio
 * version keeps every function and lookup algorithm exactly as it is in
 * production, and replaces the ~40-path real dataset with a handful of
 * generic occupation categories populated with clearly fictional employers,
 * fictional salary figures, and illustrative (not sourced) vocabulary lists.
 *
 * detectCareerPath's keyword-matching approach, the SALARY_PARENT fallback
 * mechanism (borrowing salary data from a related discipline when a specific
 * one has none of its own), and the getEmployers/getSalary/getSalience/
 * getCityPages functions are the real, unmodified architecture.
 */

const { getDisplayName, getAnchorPrefix, parseUrl, lookupCityUrls } = require('../lib/url-index');

// ─── Employer data (fictional) ─────────────────────────────────────────────

const AU_EMP = {
  "Software Engineering": [["Northbridge Digital", "northbridge-digital"], ["Example Employer A", "example-employer-a"], ["Meridian Cloud Systems", "meridian-cloud-systems"], ["Harbourline Technologies", "harbourline-technologies"], ["Vantage Analytics AU", "vantage-analytics-au"]],
  "Marketing": [["Kestrel Brands", "kestrel-brands"], ["Example Employer B", "example-employer-b"], ["Southbank Consumer Group", "southbank-consumer-group"], ["Lumen Retail Australia", "lumen-retail-australia"]],
  "Civil Engineering": [["Ironbark Infrastructure", "ironbark-infrastructure"], ["Example Employer C", "example-employer-c"], ["Coastal Works Australia", "coastal-works-australia"], ["Redgum Engineering Group", "redgum-engineering-group"]]
};

const NZ_EMP = {
  "Software Engineering": [["Northbridge Digital NZ", "northbridge-digital-nz"], ["Example Employer A NZ", "example-employer-a-nz"], ["Fernline Software", "fernline-software"], ["Harbourline Technologies NZ", "harbourline-technologies-nz"]],
  "Marketing": [["Kestrel Brands NZ", "kestrel-brands-nz"], ["Totara Consumer Group", "totara-consumer-group"], ["Lumen Retail NZ", "lumen-retail-nz"]],
  "Civil Engineering": [["Ironbark Infrastructure NZ", "ironbark-infrastructure-nz"], ["Southern Alps Engineering", "southern-alps-engineering"], ["Redgum Engineering Group NZ", "redgum-engineering-group-nz"]]
};

// ─── Salary data (fictional) ───────────────────────────────────────────────

const AU_INTERN = { "Software Engineering": { min: 30, max: 48 }, "Marketing": { min: 26, max: 35 }, "Civil Engineering": { min: 27, max: 34 } };
const NZ_INTERN = { "Software Engineering": { min: 26.0, max: 29.5 }, "Marketing": { min: 25.2, max: 27.4 }, "Civil Engineering": { min: 25.5, max: 28.9 } };

const AU_GRAD = { "Software Engineering": { min: 78000, max: 108000 }, "Marketing": { min: 62000, max: 88000 }, "Civil Engineering": { min: 74000, max: 89000 } };
const NZ_GRAD = { "Software Engineering": { min: 60000, max: 74000 }, "Marketing": { min: 58000, max: 72000 }, "Civil Engineering": { min: 64000, max: 78000 } };

// ─── Fallback salary parents ───────────────────────────────────────────────
// Demonstrates the real mechanism: a discipline with no salary data of its own
// borrows from a named, related parent discipline instead of returning nothing.

const SALARY_PARENT = { "Structural Engineering": "Civil Engineering", "Data Analytics": "Software Engineering" };

// ─── Keyword -> career path mapping (sorted longest-first for specificity) ──

const KW_MAP = [
  ["software engineer", "Software Engineering"],
  ["software developer", "Software Engineering"],
  ["computer science", "Software Engineering"],
  ["civil engineer", "Civil Engineering"],
  ["structural engineer", "Civil Engineering"],
  ["marketing", "Marketing"],
  ["brand management", "Marketing"]
];

const ENG_PATHS = ["Civil Engineering", "Software Engineering"];

// ─── Salience vocabulary (illustrative, not sourced) ───────────────────────

const SALIENCE = {
  "Software Engineering": {
    au: "Python, Java, JavaScript, React, AWS, Docker, CI/CD, REST API, Agile, Scrum, GitHub, system design, data structures, algorithms, graduate program",
    nz: "Python, Java, JavaScript, React, AWS, Docker, CI/CD, REST API, Agile, Scrum, GitHub, system design, data structures, algorithms, graduate program"
  },
  "Marketing": {
    au: "SEO, SEM, campaign management, CRM, Google Analytics, brand strategy, market research, consumer behaviour, FMCG",
    nz: "SEO, SEM, campaign management, CRM, Google Analytics, brand strategy, market research, consumer behaviour, FMCG"
  },
  "Civil Engineering": {
    au: "AutoCAD, Civil 3D, structural analysis, site inspection, project delivery, Chartered Practitioner status, National Engineering Institute",
    nz: "AutoCAD, Civil 3D, structural analysis, site inspection, project delivery, Chartered Practitioner status, National Engineering Institute"
  }
};

function getSalience(careerPaths, country) {
  const paths = Array.isArray(careerPaths) ? careerPaths : [careerPaths];
  const countryKey = (country === 'AU' || country === 'Australia') ? 'au' : 'nz';
  for (const path of paths) {
    if (path && SALIENCE[path] && SALIENCE[path][countryKey]) {
      return SALIENCE[path][countryKey];
    }
  }
  return '';
}

// ─── Helper functions ───────────────────────────────────────────────────────

function detectCareerPath(keyword) {
  const kw = keyword.toLowerCase();

  const sorted = [...KW_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [pattern, path] of sorted) {
    if (kw.includes(pattern)) return path;
  }

  if (kw.includes('engineer')) return ENG_PATHS[0];

  return 'Marketing';
}

function getEmployers(careerPath, country) {
  const empData = country === 'Australia' ? AU_EMP : NZ_EMP;
  const list = empData[careerPath] || [];
  const domain = country === 'Australia' ? 'https://au.your-platform.com' : 'https://nz.your-platform.com';
  return list.slice(0, 8).map(([name, slug]) => `[${name}](${domain}/graduate-employers/${slug})`);
}

function getSalary(careerPath, country) {
  const internTable = country === 'Australia' ? AU_INTERN : NZ_INTERN;
  const gradTable   = country === 'Australia' ? AU_GRAD   : NZ_GRAD;

  const parent = SALARY_PARENT[careerPath];

  const intern = internTable[careerPath] || (parent ? internTable[parent] : null) || null;
  const grad   = gradTable[careerPath]   || (parent ? gradTable[parent]   : null) || null;

  return { intern, grad };
}

function getCityPages(pageUrl, country) {
  const countryCode = country === 'Australia' ? 'AU' : 'NZ';
  const parsedSeed = parseUrl(pageUrl, countryCode);
  if (!parsedSeed || !parsedSeed.baseSlug) return [];

  const { urls, matchedBaseSlug } = lookupCityUrls(parsedSeed.baseSlug, countryCode);

  if (!urls.length) {
    console.warn(`WARNING: No city pages found for slug: ${parsedSeed.baseSlug} in ${countryCode}`);
    return [];
  }

  const prefix = getAnchorPrefix(matchedBaseSlug);
  const pages = urls
    .map(url => {
      const parsed = parseUrl(url, countryCode);
      if (!parsed || !parsed.citySlug) return null;
      const displayName = getDisplayName(parsed.citySlug, countryCode);
      return { name: `${prefix} in ${displayName}`, url, displayName };
    })
    .filter(Boolean);

  pages.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return pages.map(({ name, url }) => `[${name}](${url})`);
}

// ─── Main export ────────────────────────────────────────────────────────────

async function runProspleData(keyword, country, pageUrl) {
  const careerPath = detectCareerPath(keyword);
  const isAU = country === 'Australia';
  const domain = isAU ? 'https://au.your-platform.com' : 'https://nz.your-platform.com';
  const countrySuffix = isAU ? 'australia' : 'new-zealand';
  return {
    career_path:       careerPath,
    keywordCareerPath: careerPath,
    employers:         getEmployers(careerPath, country),
    salary:            getSalary(careerPath, country),
    city_pages:        getCityPages(pageUrl, country),
    page_url:          pageUrl,
    domain,
    country_suffix:    countrySuffix
  };
}

module.exports = { runProspleData, getSalience, SALIENCE };
