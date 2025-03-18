# 2024-march-madness

To run:

1. Execute `node ./load-brackets.mjs` and save the results in `./team-results-in-bracket-arrays.json`.
2. Execute `node ./calculate.mjs`. Note that before the play-in games are played, this program will likely encounter errors. This is because the play-in teams are still being included in the output from `load-brackets.mjs` and it messes up the structure of the bracket, which causes the "calculate" script to fail.
3. The content of `team-results-in-bracket-arrays.json` will still not be formatted quite right.  You will need to surround each group of two matchups with more square brackets (compare with a previous year's result to see how it needs to be structured).  Also, in 2025 the Final Four matchups were incorrect - must have something to do with how the matchups are ordered when loaded from ESPN.  That's yet another thing that might require manual intervention.
