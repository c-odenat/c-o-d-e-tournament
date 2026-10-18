import {
  checkBinaryArb,
  checkTripleArb,
  generatePairwiseCoveringArray,
  runCompounder,
  safeCalculate
} from "./logic.js";

// ---------- Theme switching (REAL) ----------
const THEME_KEY = "cru_theme"; // code-risk-utility theme preference

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  // theme: "dark" | "light" | "system"
  let actual = theme;

  if (theme === "system") {
    actual = systemPrefersDark() ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-theme", actual);
  localStorage.setItem(THEME_KEY, theme);

  // update segmented UI state
  const btns = Array.from(document.querySelectorAll(".topbar .seg-btn"));
  btns.forEach(b => b.classList.toggle("is-active", b.dataset.theme === theme));
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "system";
  applyTheme(saved);

  // If user chose "system", react to OS theme changes live
  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener?.("change", () => {
      const current = localStorage.getItem(THEME_KEY) || "system";
      if (current === "system") applyTheme("system");
    });
  }
}

// Hook clicks
document.querySelectorAll(".topbar .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// Run at startup
initTheme();

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);

function setActive(btns, activeBtn) {
  btns.forEach(b => b.classList.remove("is-active"));
  activeBtn.classList.add("is-active");
}

function cardHTML(title, value, colorClass = "") {
  return `
    <div class="card">
      <div class="card-title">${title}</div>
      <div class="card-value ${colorClass}">${value}</div>
    </div>
  `;
}

function fmtMoney(x) {
  if (Number.isFinite(x)) return `₵${x.toFixed(2)}`;
  return "—";
}

/* ---------- Navigation ---------- */

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const views = {
  arb: $("view-arb"),
  cover: $("view-cover"),
  compound: $("view-compound"),
  calc: $("view-calc"),
};

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    navItems.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    Object.values(views).forEach(v => v.classList.remove("is-visible"));
    const target = btn.dataset.view;
    views[target].classList.add("is-visible");
  });
});


/* ---------- Arbitrage ---------- */

let arbMode = "2";

const arbModeBtns = Array.from(document.querySelectorAll("#arb-mode .seg-btn"));
arbModeBtns.forEach(b => {
  b.addEventListener("click", () => {
    setActive(arbModeBtns, b);
    arbMode = b.dataset.mode;
    $("arb-draw-row").style.display = arbMode === "3" ? "flex" : "none";
  });
});

$("btn-arb").addEventListener("click", () => {
  $("arb-error").textContent = "";
  $("arb-cards").innerHTML = "";
  $("arb-table").querySelector("tbody").innerHTML = "";

  const a = Number($("arb-odd-a").value);
  const b = Number($("arb-odd-b").value);
  const stake = Number($("arb-stake").value);

  if (!a || !b || a <= 1 || b <= 1 || !stake || stake <= 0) {
    $("arb-error").textContent = "Enter valid odds (>1) and stake (>0).";
    return;
  }

  if (arbMode === "2") {
    const res = checkBinaryArb(a, b, stake);

    if (!res.arb) {
      $("arb-cards").innerHTML = cardHTML("Status", "NO ARB", "text-red");
      return;
    }

    $("arb-cards").innerHTML =
      cardHTML("Status", "ARB EXISTS", "text-green") +
      cardHTML("Inv Sum", res.invSum.toFixed(5)) +
      cardHTML("Profit", fmtMoney(res.profit), "text-green") +
      cardHTML("ROI", `${res.roi.toFixed(2)}%`) +
      cardHTML("Payout", fmtMoney(res.payout));

    const tbody = $("arb-table").querySelector("tbody");
    const rows = [
      ["A", a, res.stakeA, res.stakeA * a],
      ["B", b, res.stakeB, res.stakeB * b],
    ];

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
        <td>${fmtMoney(r[2])}</td>
        <td>${fmtMoney(r[3])}</td>
      </tr>
    `).join("");

  } else {
    const d = Number($("arb-odd-d").value);
    if (!d || d <= 1) {
      $("arb-error").textContent = "Enter a valid Draw odd (>1).";
      return;
    }

    const res = checkTripleArb({ Home: a, Draw: d, Away: b }, stake);

    if (!res.arb) {
      $("arb-cards").innerHTML = cardHTML("Status", "NO ARB", "text-red");
      return;
    }

    $("arb-cards").innerHTML =
      cardHTML("Status", "ARB EXISTS", "text-green") +
      cardHTML("Inv Sum", res.invSum.toFixed(5)) +
      cardHTML("Profit", fmtMoney(res.profit), "text-green") +
      cardHTML("ROI", `${res.roi.toFixed(2)}%`) +
      cardHTML("Payout", fmtMoney(res.payout));

    const tbody = $("arb-table").querySelector("tbody");
    const rows = [
      ["Home", a, res.stakes.Home, res.stakes.Home * a],
      ["Draw", d, res.stakes.Draw, res.stakes.Draw * d],
      ["Away", b, res.stakes.Away, res.stakes.Away * b],
    ];

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
        <td>${fmtMoney(r[2])}</td>
        <td>${fmtMoney(r[3])}</td>
      </tr>
    `).join("");
  }
});

/* ---------- Covering Array ---------- */

$("btn-cover").addEventListener("click", () => {
  const n = Number($("cover-games").value || 10);
  if (!n || n < 2 || n > 20) {
    $("cover-meta").textContent = "Games: must be 2–20";
    return;
  }

  const rows = generatePairwiseCoveringArray(n);
  $("cover-meta").textContent = `Tickets: ${rows.length}`;

  const board = $("cover-board");
  board.innerHTML = "";

  rows.forEach((ticket, i) => {
    const chips = ticket.map((v, idx) => {
      const cls = v === "a" ? "chip a" : "chip b";
      return `<span class="${cls}">${idx + 1}:${v}</span>`;
    }).join("");

    const el = document.createElement("div");
    el.className = "ticket";
    el.innerHTML = `
      <div class="ticket-head">
        <div class="ticket-title">Ticket ${i + 1}</div>
        <div class="ticket-tag">${n} games</div>
      </div>
      <div class="ticket-body">${chips}</div>
    `;
    board.appendChild(el);
  });
});

/* ---------- Compounder ---------- */

$("btn-compound").addEventListener("click", () => {
  $("cmp-error").textContent = "";
  $("cmp-cards").innerHTML = "";
  $("cmp-table").querySelector("tbody").innerHTML = "";

  const cap = Number($("cmp-capital").value);
  const mult = Number($("cmp-mult").value);
  const steps = Number($("cmp-steps").value);

  if (!cap || cap <= 0 || !mult || mult <= 0 || !steps || steps <= 0) {
    $("cmp-error").textContent = "Enter valid inputs (>0).";
    return;
  }

  const res = runCompounder(cap, mult, steps);
  const final = res.final;
  const gain = final - cap;

  $("cmp-cards").innerHTML =
    cardHTML("Initial", fmtMoney(cap)) +
    cardHTML("Multiplier", mult) +
    cardHTML("Steps", steps) +
    cardHTML("Final", fmtMoney(final), "text-green") +
    cardHTML("Net Gain", fmtMoney(gain), "text-green");

  const tbody = $("cmp-table").querySelector("tbody");
  tbody.innerHTML = res.history.map(h => `
    <tr>
      <td>${h.step}</td>
      <td>${fmtMoney(h.capital)}</td>
    </tr>
  `).join("");
});

/* ---------- Calculator (keypad) ---------- */

const calcBtns = [
  "C","(",")","⌫",
  "7","8","9","/",
  "4","5","6","*",
  "1","2","3","-",
  "0",".","=","+"
];

let expr = "";

function renderCalc() {
  $("calc-big").textContent = expr || "0";
}

function pushCalc(token) {
  if (token === "C") { expr = ""; $("calc-mini").textContent = "Cleared"; renderCalc(); return; }
  if (token === "⌫") { expr = expr.slice(0,-1); renderCalc(); return; }
  if (token === "=") {
    const out = safeCalculate(expr);
    if (!out.ok) { $("calc-mini").textContent = "Error"; return; }
    $("calc-mini").textContent = "Result";
    expr = String(out.result);
    renderCalc();
    return;
  }
  expr += token;
  $("calc-mini").textContent = "Typing…";
  renderCalc();
}

const grid = $("calc-grid");
grid.innerHTML = calcBtns.map(b => {
  const cls =
    b === "=" ? "cbtn eq" :
    b === "C" ? "cbtn danger" :
    ["/","*","-","+"].includes(b) ? "cbtn op" :
    "cbtn";
  return `<button class="${cls}" data-k="${b}">${b}</button>`;
}).join("");

grid.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => pushCalc(btn.dataset.k));
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k === "Enter") return pushCalc("=");
  if (k === "Backspace") return pushCalc("⌫");
  if (k === "Escape") return pushCalc("C");
  if ("0123456789.+-*/()".includes(k)) return pushCalc(k);
});

/* tiny helper classes */
const style = document.createElement("style");
style.textContent = `
  .text-green{color:#22c55e}
  .text-red{color:#ef4444}
`;
document.head.appendChild(style);
