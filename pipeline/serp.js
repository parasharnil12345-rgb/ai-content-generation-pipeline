const axios = require('axios');

const SERPER_KEY = process.env.SERPER_API_KEY;
const SERPER_URL = 'https://google.serper.dev/search';

async function runSerpResearch(keyword, country) {
  const { data } = await axios.post(
    SERPER_URL,
    { q: `${keyword} ${country}`, num: 10 },
    { headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' } }
  );

  return {
    organic: (data.organic || []).slice(0, 10).map(r => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet || ''
    })),
    peopleAlsoAsk: (data.peopleAlsoAsk || []).map(q => q.question),
    relatedSearches: (data.relatedSearches || []).map(s => s.query)
  };
}

module.exports = { runSerpResearch };
