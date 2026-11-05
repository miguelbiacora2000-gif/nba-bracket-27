# NBA Bracket 27

Classic NBA playoff bracket pool for the group: West on the left, East on the right, winners converge to the Finals. Most points takes the pot.

Live site: https://miguelbiacora2000-gif.github.io/nba-bracket-27/
Sister site (season awards + Finals picks): https://miguelbiacora2000-gif.github.io/nba-predictions-27/

## How friends play
Open the site, tap a team to win each series (it advances), set the games under each series, add your name, hit "Copy my picks" and paste the text into the group chat.

## Admin (Miguel)
- Seeds: edit `seeds.js` once the play-in ends (mid-April 2027). Replace each "TBD" with the team name; the bracket fills itself.
- Entries: paste each friend's copied picks (or JSON) into `picks.js`.
- Results: as series end, record winners in `results.js`; the leaderboard scores itself (R1 5, semis 8, conf finals 12, Finals 20, +2 exact games; max 145).

Both repos must stay public for free GitHub Pages hosting.
