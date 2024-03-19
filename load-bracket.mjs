import {load} from 'cheerio';

const bracketPage = await fetch('https://www.espn.com/mens-college-basketball/bracket', {
  headers: {
    accept:
      "text/htmlimport {} from 'pplication/xhtml+xmlimport {} from 'pplication/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8import {} from 'pplication/signed-exchange;v=b3;q=0.7",
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    Referer: 'https://www.espn.com/mens-college-basketball/',
    'Referrer-Policy': 'origin-when-cross-origin'
  },
  body: null,
  method: 'GET'
});

const html = await bracketPage.text();
const root = load(html);

// console.log(html);
const matchupLinks = root('a.AnchorLink.BracketCell')
  .toArray()
  .map((el) => el.attribs.href);

const matchupInfo = await Promise.all(
  matchupLinks.map(async (matchupLink) => {
    const matchupContent = await fetch(`https://www.espn.com${matchupLink}`, {
      headers: {
        accept:
          "text/htmlimport {} from 'pplication/xhtml+xmlimport {} from 'pplication/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8import {} from 'pplication/signed-exchange;v=b3;q=0.7",
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        Referer: 'https://www.espn.com/mens-college-basketball/bracket',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: null,
      method: 'GET'
    });

    const matchupHtml = await matchupContent.text();
    const matchupRoot = load(matchupHtml);

    const teamNameAndRank = matchupRoot('div.Gamestrip__Info')
      .toArray()
      .map((el) => {
        const rank = matchupRoot(el).find('.ScoreCell__Rank').text();
        const name = matchupRoot(el).find('.ScoreCell__TeamName').text();

        return {
          rank: +rank,
          name
        };
      });

    const teamSchedule = matchupRoot('div.LastGames__GameList footer.Card__Footer')
      .toArray()
      .map((el) => {
        const schedule = matchupRoot(el).find('a.AnchorLink').attr('href');
        return {schedule, id: schedule?.split?.('/')?.pop()};
      });

    return teamNameAndRank.map((team, index) => {
      return {...team, ...teamSchedule[index]};
    });
  })
);

const allTeams = matchupInfo.reduce((soFar, matchup) => {
  return [...soFar, ...matchup.filter((team) => team.rank !== 0)];
}, []);

const allTeamsWithStatus = await Promise.all(
  allTeams.slice(0, 1).map(async (team) => {
    const schedulePage = await fetch(team.schedule, {
      headers: {
        accept:
          "text/htmlimport {} from 'pplication/xhtml+xmlimport {} from 'pplication/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8import {} from 'pplication/signed-exchange;v=b3;q=0.7",
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      },
      body: null,
      method: 'GET'
    });

    const scheduleHtml = await schedulePage.text();
    const scheduleRoot = load(scheduleHtml);

    const resultRows = scheduleRoot('tr')
      .toArray()
      .filter((resultRow) => {
        return scheduleRoot(resultRow).children('td').length === 7;
      })
      .filter((resultRow) => {
        return scheduleRoot(resultRow).children().first().text() !== 'DATE';
      });

    const scores = resultRows
      .map((resultRow) => {
        return {
          resultCell: scheduleRoot(resultRow).children('td').toArray()[2],
          opponentCell: scheduleRoot(resultRow).children('td').toArray()[1]
        };
      })
      .map((resultCells) => {
        const result = scheduleRoot(resultCells.resultCell).text();
        const isVictory = result.startsWith('W');
        const scores = result
          .slice(1)
          .replace(' OT', '')
          .split('-')
          .reduce((soFar, part, index) => {
            const scoreInt = parseInt(part, 10);

            if (typeof scoreInt !== 'number') {
              throw new Error(`The value ${part} is not a number`);
            }

            return {...soFar, ...(index === 0 ? {first: scoreInt} : {second: scoreInt})};
          }, {});

        return {isVictory, ...scores};
      })
      .map((result) => {
        const ourScore = result.first > result.second && result.isVictory ? result.first : result.second;
        const theirScore = result.first > result.second && !result.isVictory ? result.first : result.second;

        return {
          ourScore,
          theirScore
        };
      });

    console.log(team);
    console.log(scores);
  })
);

// console.log(allTeams);
/*
  .map((el) => {
    return el.attribs['href'];
  })
  .forEach(console.log);
  */
