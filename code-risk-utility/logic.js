export function checkBinaryArb(oddA, oddB, stake) {
  const invSum = (1 / oddA) + (1 / oddB);
  const arbExists = invSum < 1;

  if (!arbExists) return { arb: false, invSum };

  const stakeA = stake * (1 / oddA) / invSum;
  const stakeB = stake * (1 / oddB) / invSum;
  const payout = stake / invSum;
  const profit = payout - stake;

  return {
    arb: true,
    invSum,
    stakeA,
    stakeB,
    payout,
    profit,
    roi: (profit / stake) * 100
  };
}

export function checkTripleArb(odds, stake) {
  const invSum = Object.values(odds).reduce((s, o) => s + (1 / o), 0);
  if (invSum >= 1) return { arb: false, invSum };

  const stakes = {};
  let payout = 0;

  for (const key in odds) {
    stakes[key] = stake * (1 / odds[key]) / invSum;
    payout = stakes[key] * odds[key];
  }

  return {
    arb: true,
    invSum,
    stakes,
    payout,
    profit: payout - stake,
    roi: ((payout - stake) / stake) * 100
  };
}

export function generatePairwiseCoveringArray(games = 10) {
  const VALUES = [0, 1];

  const allPairs = new Set();
  for (let i = 0; i < games; i++) {
    for (let j = i + 1; j < games; j++) {
      for (const vi of VALUES) for (const vj of VALUES) {
        allPairs.add(`${i},${j},${vi},${vj}`);
      }
    }
  }

  function covers(row) {
    const set = new Set();
    for (let i = 0; i < games; i++) {
      for (let j = i + 1; j < games; j++) {
        set.add(`${i},${j},${row[i]},${row[j]}`);
      }
    }
    return set;
  }

  let uncovered = new Set(allPairs);
  const rows = [];

  while (uncovered.size > 0) {
    let bestRow = null;
    let bestCoverage = new Set();

    for (let t = 0; t < 2000; t++) {
      const candidate = Array.from({ length: games }, () => (Math.random() < 0.5 ? 0 : 1));
      const cset = covers(candidate);
      const hit = new Set([...cset].filter(x => uncovered.has(x)));

      if (hit.size > bestCoverage.size) {
        bestRow = candidate;
        bestCoverage = hit;
      }
    }

    rows.push(bestRow.map(v => (v === 0 ? "a" : "b")));
    bestCoverage.forEach(x => uncovered.delete(x));
  }

  return rows;
}

export function runCompounder(initial, multiplier, steps) {
  let capital = initial;
  const history = [];

  for (let i = 1; i <= steps; i++) {
    capital *= multiplier;
    history.push({ step: i, capital });
  }

  return { final: capital, history };
}

export function safeCalculate(expression) {
  try {
    const result = Function(`"use strict"; return (${expression})`)();
    return { ok: true, result };
  } catch {
    return { ok: false };
  }
}
