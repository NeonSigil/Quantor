document.getElementById('eoq-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get values from inputs
    const D = parseFloat(document.getElementById('demand').value);
    const S = parseFloat(document.getElementById('orderCost').value);
    const H = parseFloat(document.getElementById('holdingCost').value);

    // Validate inputs
    if (isNaN(D) || isNaN(S) || isNaN(H) || D <= 0 || S <= 0 || H <= 0) {
        alert('Please enter valid positive numbers in all fields.');
        return;
    }

    // EOQ Formula: sqrt((2DS)/H)
    const EOQ = Math.sqrt((2 * D * S) / H);
    const totalCost = ((D / EOQ) * S) + ((EOQ / 2) * H);

    // Display results
    document.getElementById('eoq-output').textContent = `EOQ: ${EOQ.toFixed(2)} units`;
    document.getElementById('total-cost-output').textContent = `Total Annual Cost: $${totalCost.toFixed(2)}`;

    // === Caelum Codex Logging Begins ===
    generateBehaviorLog(D, S, H, EOQ, totalCost);
});

function generateBehaviorLog(D, S, H, EOQ, totalCost) {
    let pattern = "";

    if (D > 5000) {
        pattern = "bulk-ordering_behavior";
    } else if (H > S) {
        pattern = "holding-dominant_strategy";
    } else if (EOQ < 100) {
        pattern = "frequent_small_orders";
    } else {
        pattern = "balanced_strategy";
    }

    const log = {
        pattern: pattern,
        demand: D,
        orderCost: S,
        holdingCost: H,
        eoq: EOQ.toFixed(2),
        totalCost: totalCost.toFixed(2),
        timestamp: new Date().toISOString()
    };

    console.log("Codex Log Generated:", log);

    // Optional: Show JSON preview on screen
    const logDisplay = document.createElement("pre");
    logDisplay.style.marginTop = "20px";
    logDisplay.style.backgroundColor = "#111";
    logDisplay.style.padding = "10px";
    logDisplay.textContent = JSON.stringify(log, null, 2);
    document.getElementById("result").appendChild(logDisplay);
}
