import {readFileSync, writeFileSync} from 'node:fs';
import {execSync} from 'node:child_process';

const input = JSON.parse(readFileSync('./team-results-in-bracket-arrays.json'));

function calculateWinner(team1, team2) {
  console.log('');
  console.log(`Who will win between (${team1.rank}) ${team1.name} and (${team2.rank}) ${team2.name}?`);

  const teamWithBetterDifferential =
    team1.tournamentTeamsPointDifferential > team2.tournamentTeamsPointDifferential ? team1 : team2;
  const teamWithWorseDifferential = teamWithBetterDifferential === team1 ? team2 : team1;

  const teamWithBetterDifferentialAverage =
    teamWithBetterDifferential.tournamentTeamsPointDifferential / teamWithBetterDifferential.tournamentTeamsPlayed;
  const teamWithWorseDifferentialAverage =
    teamWithWorseDifferential.tournamentTeamsPointDifferential / teamWithWorseDifferential.tournamentTeamsPlayed;

  const teamWithMoreWins = team1.tournamentTeamsDefeated > team2.tournamentTeamsDefeated ? team1 : team2;
  const teamWithFewerWins = teamWithMoreWins === team1 ? team2 : team1;

  const teamWithMoreGames = team1.tournamentTeamsPlayed > team2.tournamentTeamsPlayed ? team1 : team2;
  const teamWithFewerGames = teamWithMoreGames === team1 ? team2 : team1;

  if (team1.id === null || team2.id === null) {
    const teamWithNullId = team1.id === null ? team1 : team2;
    const teamWithoutNullId = teamWithNullId === team1 ? team2 : team1;

    console.log(`${teamWithoutNullId.name} wins because ${teamWithNullId.name} was a play-in team`);

    return teamWithoutNullId;
  }

  if (teamWithBetterDifferential.tournamentTeamsPlayed === 0 && teamWithWorseDifferential.tournamentTeamsPlayed > 0) {
    console.log(
      `${teamWithWorseDifferential.name} wins because ${teamWithBetterDifferential.name} has not played any tournament teams`
    );

    return teamWithWorseDifferential;
  }

  if (team1.tournamentTeamsPointDifferential !== team2.tournamentTeamsPointDifferential) {
    console.log(
      `${teamWithBetterDifferential.name} wins because their point differential of ${teamWithBetterDifferential.tournamentTeamsPointDifferential} is better than the point differential for ${teamWithWorseDifferential.name} of ${teamWithWorseDifferential.tournamentTeamsPointDifferential}`
    );

    if (teamWithWorseDifferentialAverage > teamWithBetterDifferentialAverage) {
      console.log('NOTE: If we were doing averages, the result would be reversed!');
    }

    return teamWithBetterDifferential;
  } else {
    console.log('The point differential is a tie, moving to first tiebreaker...');
  }

  if (team1.tournamentTeamsDefeated !== team2.tournamentTeamsDefeated) {
    console.log(
      `${teamWithMoreWins.name} wins because they have ${teamWithMoreWins.tournamentTeamsDefeated} win(s) over tournament teams, which is more than the ${teamWithFewerWins.tournamentTeamsDefeated} win(s) of ${teamWithFewerWins.name}`
    );

    return teamWithMoreWins;
  } else {
    console.log('Both teams have the same number of wins over tournament teams, moving to second tiebreaker...');
  }

  if (team1.tournamentTeamsPlayed !== team2.tournamentTeamsPlayed) {
    console.log(
      `${teamWithMoreGames.name} wins because they have played ${teamWithMoreGames.tournamentTeamsPlayed} game(s) against tournament teams, which is more than the ${teamWithFewerGames.tournamentTeamsPlayed} game(s) played of ${teamWithFewerGames.tournamentTeamsPlayed}`
    );

    return teamWithMoreGames;
  } else {
    console.log('Both teams have played the same number of tournament teams! I have no idea what to do.');
    throw new Error();
  }
}

function execute(round) {
  return round.reduce((soFar, matchups, index) => {
    if (index % 2 === 0) {
      return [...soFar, [[...matchups.map((matchup) => calculateWinner(matchup[0], matchup[1])), matchups]]];
    } else {
      const lastItem = soFar[soFar.length - 1];
      return [
        ...soFar.slice(0, soFar.length - 1),
        [...lastItem, [...matchups.map((matchup) => calculateWinner(matchup[0], matchup[1])), matchups]]
      ];
    }
  }, []);
}

console.log('-------------- Round 1 ---------------');
const roundOf32 = execute(input);

console.log('');
console.log('-------------- Round of 32 ---------------');
const roundOf16 = execute(roundOf32);

console.log('');
console.log('-------------- Sweet 16 ---------------');
const roundOf8 = execute(roundOf16);

console.log('');
console.log('-------------- Elite 8 ---------------');
const finalFour = execute(roundOf8);

console.log('');
console.log('-------------- Final Four ---------------');
const championship = execute(finalFour);

console.log('');
console.log('-------------- National Championship ---------------');
const champion = execute(championship);

console.log(`Congratulations to the national champion ${champion[0][0][0].name}!`);
/*
const roundOf32 = execute(input);
writeFileSync('./output-32.json', JSON.stringify(roundOf32, null, 2));

const sweet16 = execute(roundOf32);
writeFileSync('./output-16.json', JSON.stringify(sweet16, null, 2));

const elite8 = execute(sweet16);
writeFileSync('./output-8.json', JSON.stringify(elite8, null, 2));

const final4 = execute(elite8);
writeFileSync('./output-4.json', JSON.stringify(final4, null, 2));

const nationalChampionship = execute(final4);
writeFileSync('./output-2.json', JSON.stringify(nationalChampionship, null, 2));

const nationalChampion = execute(nationalChampionship);
writeFileSync('./output-1.json', JSON.stringify(nationalChampion, null, 2));

console.log(JSON.stringify(nationalChampion, null, 2));
*/
