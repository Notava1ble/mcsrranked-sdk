import { mcsrranked } from "../src/index.js";

const me = await mcsrranked.users.get("NotAva1able");

const myElo = me.eloRate;

console.log(me.nickname, myElo);

const recentMatches = await mcsrranked.users.matches(me.nickname, {
  count: 50,
  type: 2,
});

const changes = recentMatches
  .map((match) => match.changes.find((entry) => entry.uuid === me.uuid)?.change)
  .filter(
    (change): change is number => change !== null && change !== undefined,
  );
const net = changes.reduce((total, change) => total + change, 0);

console.log(`
  TOTAL NET CHANGE THESE PAST 50 RANKED MATCHES: ${net}

  EACH CHANGE: ${changes.join(" ")}
  `);

const matches = await mcsrranked.matches.list({ count: 10 });

for (const match of matches) {
  const names = match.players.map((player) => player.nickname).join(" vs ");
  console.log(`#${match.id}: ${names}`);
}
