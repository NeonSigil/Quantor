/* ===============================
   Quantor — Script (Crisp Halo + Centered Toggle)
   =============================== */

const caelumCodexMemory = [];

// Formatters (human-friendly numbers)
const fmtQty = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// DOM refs
const themeIcon = document.getElementById("theme-icon");
const themeToggle = document.getElementById("theme-toggle");
const form = document.getElementById("eoq-form");
const demandEl = document.getElementById("demand");
const orderEl = document.getElementById("orderCost");
const holdingEl = document.getElementById("holdingCost");
const eoqOut = document.getElementById("eoq-output");
const totalOut = document.getElementById("total-cost-output");
const resultBox = document.getElementById("result");

// ===== Utilities =====
const isPos = v => !isNaN(v) && v > 0;

function markInvalid(el, invalid = true) {
    el.style.boxShadow = invalid ? '0 0 0 2px #f44' : '';
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== EOQ Logic =====
function calculateEOQ(D, S, H) {
    // EOQ = sqrt( (2DS) / H )
    return Math.sqrt((2 * D * S) / H);
}

function totalAnnualCost(D, S, H, EOQ) {
    // TAC = (D/EOQ)*S + (EOQ/2)*H
    return (D / EOQ) * S + (EOQ / 2) * H;
}

// ===== Behavior Log (Phase II seed-ready) =====
function generateBehaviorLog(D, S, H, EOQ, totalCost) {
    let pattern = "";
    if (D > 5000) pattern = "bulk-ordering_behavior";
    else if (H > S) pattern = "holding-dominant_strategy";
    else if (EOQ < 100) pattern = "frequent_small_orders";
    else pattern = "balanced_strategy";

    const log = {
        pattern,
        demand: D,
        orderCost: S,
        holdingCost: H,
        eoq: Number(EOQ.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        timestamp: new Date().toISOString()
    };

    caelumCodexMemory.push(log);

    const logDisplay = document.createElement("pre");
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "[X]";
    closeBtn.style.cssText = "float:right; cursor:pointer; font-weight:bold; margin-left:8px; color:#f44;";
    closeBtn.onclick = () => logDisplay.remove();

    logDisplay.appendChild(closeBtn);
    logDisplay.appendChild(document.createTextNode("\n" + JSON.stringify(log, null, 2)));
    resultBox.appendChild(logDisplay);
}

// ===== Form Handling =====
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const D = parseFloat(demandEl.value);
    const S = parseFloat(orderEl.value);
    const H = parseFloat(holdingEl.value);

    let hasErr = false;
    if (!isPos(D)) { markInvalid(demandEl, true); hasErr = true; } else { markInvalid(demandEl, false); }
    if (!isPos(S)) { markInvalid(orderEl, true); hasErr = true; } else { markInvalid(orderEl, false); }
    if (!isPos(H)) { markInvalid(holdingEl, true); hasErr = true; } else { markInvalid(holdingEl, false); }

    if (hasErr) { showToast("Please enter positive numbers for all fields."); return; }

    const EOQ = calculateEOQ(D, S, H);
    const totalCost = totalAnnualCost(D, S, H, EOQ);

    eoqOut.textContent = `EOQ: ${fmtQty.format(EOQ)} units`;
    totalOut.textContent = `Total Annual Cost: ${fmtMoney.format(totalCost)}`;

    generateBehaviorLog(D, S, H, EOQ, totalCost);
});

// Clear red outline on focus/typing
[demandEl, orderEl, holdingEl].forEach(el => {
    el.addEventListener('input', () => markInvalid(el, false));
    el.addEventListener('focus', () => markInvalid(el, false));
});

// ===== THEME TOGGLE (adds halo class to keep icon crisp) =====
function applyTheme(isDark) {
    const root = document.documentElement;

    if (isDark) {
        root.style.setProperty('--bg', '#111');
        root.style.setProperty('--text', '#eeeeee');
        root.style.setProperty('--container-bg', '#1b1b1b');
        root.style.setProperty('--result-bg', '#222');
        themeIcon.src = "assets/LightModeIcon.png";
        themeToggle.classList.remove('glow-dark');
        themeToggle.classList.add('glow-light');   // halo for light icon
    } else {
        root.style.setProperty('--bg', '#f9f9f9');
        root.style.setProperty('--text', '#111');
        root.style.setProperty('--container-bg', '#ffffff');
        root.style.setProperty('--result-bg', '#eeeeee');
        themeIcon.src = "assets/DarkModeIcon.png";
        themeToggle.classList.remove('glow-light');
        themeToggle.classList.add('glow-dark');    // halo for dark icon
    }

    localStorage.setItem('quantor-theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const current = localStorage.getItem('quantor-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme === 'dark');
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('quantor-theme') || 'dark';
    applyTheme(savedTheme === 'dark');
});

// ===== RESET =====
document.getElementById('reset-button').addEventListener('click', () => {
    [demandEl, orderEl, holdingEl].forEach(el => {
        el.value = '';
        markInvalid(el, false);
    });
    eoqOut.textContent = '';
    totalOut.textContent = '';
    resultBox.querySelectorAll("pre").forEach(el => el.remove());
    caelumCodexMemory.length = 0;
    showToast("Form and logs cleared.");
});
