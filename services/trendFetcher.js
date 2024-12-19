const axios = require('axios');
const cheerio = require('cheerio');

async function trendFetcher() {
    const url = 'https://databox.com/ppc-industry-benchmarks';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const trends = [];
    $('table tr').each((_, el) => {
        const columns = $(el).find('td');
        if (columns.length > 0) {
            trends.push($(columns[0]).text());
        }
    });

    return trends.slice(0, 5).join(', ');
}

module.exports = trendFetcher;
