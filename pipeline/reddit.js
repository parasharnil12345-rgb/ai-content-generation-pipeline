const axios = require('axios');

const SERPER_KEY = process.env.SERPER_API_KEY;
const SERPER_URL = 'https://google.serper.dev/search';

function buildStudentQuestion(keyword, country) {
  return `What are key things students discuss when looking for ${keyword} in ${country}? site:reddit.com`;
}

async function runRedditResearch(keyword, country) {
  const query = buildStudentQuestion(keyword, country);

  const { data } = await axios.post(
    SERPER_URL,
    { q: query, num: 10 },
    { headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' } }
  );

  return {
    question: query,
    results: (data.organic || []).slice(0, 10).map(r => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet || ''
    }))
  };
}

module.exports = { runRedditResearch };
