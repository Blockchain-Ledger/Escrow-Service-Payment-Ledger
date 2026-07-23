/* =========================================================
   Blockchain.com — Node Purchase Page (shared script)
   Reads tier data from <body data-*> attributes and renders
   the checkout UI, quantity selector, live totals, and
   BTC wallet payment section.
   ========================================================= */

(function () {
    'use strict';

    /* ---------- Read tier config from body dataset ---------- */
    const body = document.body;
    const tier = {
        name: body.dataset.tier,                        // "Basic" | "Advanced" | "Premium"
        num:  parseInt(body.dataset.tierNum, 10),       // 1 | 2 | 3
        price: parseFloat(body.dataset.price),          // USD price per unit
        required: parseInt(body.dataset.required, 10),  // nodes required to complete
        processing: body.dataset.processing,            // "3 business days" etc.
        wallet: body.dataset.wallet                     // BTC receiving address
    };

    // Reference BTC price for USD → BTC conversion (illustrative)
    const BTC_PRICE_USD = 65500;

    /* ---------- Utility formatters ---------- */
    const fmtUSD = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtBTC = n => n.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }) + ' BTC';

    /* ---------- Build the DOM ---------- */
    const root = document.getElementById('purchase-root');

    root.innerHTML = `
        <!-- Page title -->
        <div class="p-title-block">
            <span class="p-eyebrow">Tier ${tier.num} · Node Purchase</span>
            <h1 class="p-title">Purchase ${tier.name} <span class="accent">Transmission Nodes</span></h1>
            <p class="p-subtitle">
                Complete your purchase to activate your ${tier.name.toLowerCase()} transmission nodes.
                Payment is settled in BTC to the wallet address provided below.
            </p>
        </div>

        <!-- Info stripes -->
        <div class="info-row">
            <div class="info-tile">
                <span class="ico"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
                <div><div class="lbl">Tier</div><div class="val">${tier.name} · Tier ${tier.num}</div></div>
            </div>
            <div class="info-tile">
                <span class="ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
                <div><div class="lbl">Processing</div><div class="val">${tier.processing}</div></div>
            </div>
            <div class="info-tile">
                <span class="ico"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v6l-8 10L4 10V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
                <div><div class="lbl">Nodes required</div><div class="val">${tier.required} to complete</div></div>
            </div>
        </div>

        <!-- 2-column checkout -->
        <section class="checkout-grid" style="margin-top:28px;">

            <!-- LEFT: order form -->
            <div class="card">
                <h2 class="card-title">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h2l2.6 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L22 8H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="18" cy="21" r="1.4" fill="currentColor"/></svg>
                    Order Summary
                </h2>

                <div class="form-row">
                    <label class="form-label" for="qty-select">Select Quantity</label>
                    <div class="select-wrap">
                        <select id="qty-select" class="qty-select" aria-label="Quantity of nodes">
                            ${buildOptions(tier.required)}
                        </select>
                    </div>
                    <button type="button" class="req-pill" id="req-pill" style="margin-top:12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Quick-select recommended: <strong>${tier.required} node${tier.required > 1 ? 's' : ''}</strong>
                    </button>
                    <div class="hint">
                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16.5v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        You need <strong style="color:var(--text)">${tier.required}</strong> ${tier.name} node${tier.required > 1 ? 's' : ''} in total to complete your transaction.
                    </div>
                </div>

                <div style="margin-top:8px;">
                    <div class="line"><span>Unit price</span><span>${fmtUSD(tier.price)}</span></div>
                    <div class="line"><span>Quantity</span><span id="line-qty">${tier.required}</span></div>
                    <div class="line"><span>Subtotal</span><span id="line-sub">${fmtUSD(tier.price * tier.required)}</span></div>
                    <div class="line"><span>Network fee</span><span>Included</span></div>

                    <div class="total-line">
                        <span class="lbl">Total</span>
                        <span>
                            <span class="val" id="line-total">${fmtUSD(tier.price * tier.required)}</span>
                            <span class="btc" id="line-btc">≈ ${fmtBTC((tier.price * tier.required) / BTC_PRICE_USD)}</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- RIGHT: BTC payment -->
            <div class="card wallet-block">
                <h2 class="card-title" style="justify-content:center;">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3M21 10h-5a2 2 0 0 0 0 4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                    Bitcoin Payment
                </h2>

                <div class="qr" aria-hidden="true">${buildQR(tier.wallet)}</div>

                <div style="font-size:12px;color:var(--text-2);text-transform:uppercase;letter-spacing:0.1em;font-weight:600;margin-bottom:8px;text-align:left;">
                    Payment Bitcoin Wallet Address
                </div>
                <div class="wallet-row">
                    <span id="wallet-addr">${tier.wallet}</span>
                    <button class="copy-btn" id="copy-btn" aria-label="Copy wallet address" title="Copy">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    </button>
                </div>

                <button class="confirm-btn" id="confirm-btn" type="button">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    I have sent the payment
                </button>

                <div class="notice" id="notice">
                    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Thank you! We'll verify your payment on the blockchain and activate your nodes shortly.
                </div>
            </div>
        </section>
    `;

    /* ---------- Build <option> list up to a sensible max ---------- */
    function buildOptions(required) {
        const max = Math.max(required * 4, 12);
        let opts = '';
        for (let i = 1; i <= max; i++) {
            const selected = (i === required) ? ' selected' : '';
            const suffix = (i === required) ? ' (recommended)' : '';
            opts += `<option value="${i}"${selected}>${i} node${i > 1 ? 's' : ''}${suffix}</option>`;
        }
        return opts;
    }

    /* ---------- Faux QR: deterministic dot pattern from the address ---------- */
    function buildQR(text) {
        const size = 25;                 // grid size
        const cell = 100 / size;         // percentage-based sizing
        let seed = 0;
        for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
        // Simple PRNG
        const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

        let cells = '';
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Corner "finder" squares like a real QR
                const inCorner =
                    (x < 7 && y < 7) ||
                    (x >= size - 7 && y < 7) ||
                    (x < 7 && y >= size - 7);
                let fill;
                if (inCorner) {
                    const cx = x < 7 ? x : (x - (size - 7));
                    const cy = y < 7 ? y : (y - (size - 7));
                    const onBorder = (cx === 0 || cx === 6 || cy === 0 || cy === 6);
                    const inCenter = (cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4);
                    fill = onBorder || inCenter;
                } else {
                    fill = rand() > 0.55;
                }
                if (fill) {
                    cells += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#08111F"/>`;
                }
            }
        }
        return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bitcoin payment QR code">${cells}</svg>`;
    }

    /* ---------- Wire interactivity ---------- */
    const qtySel   = document.getElementById('qty-select');
    const lineQty  = document.getElementById('line-qty');
    const lineSub  = document.getElementById('line-sub');
    const lineTot  = document.getElementById('line-total');
    const lineBtc  = document.getElementById('line-btc');
    const reqPill  = document.getElementById('req-pill');
    const copyBtn  = document.getElementById('copy-btn');
    const addrEl   = document.getElementById('wallet-addr');
    const confirm  = document.getElementById('confirm-btn');
    const notice   = document.getElementById('notice');

    function recalc() {
        const q = parseInt(qtySel.value, 10) || 1;
        const sub = tier.price * q;
        lineQty.textContent = q;
        lineSub.textContent = fmtUSD(sub);
        lineTot.textContent = fmtUSD(sub);
        lineBtc.textContent = '≈ ' + fmtBTC(sub / BTC_PRICE_USD);
    }
    qtySel.addEventListener('change', recalc);

    // Quick-select recommended quantity pill
    reqPill.addEventListener('click', () => {
        qtySel.value = String(tier.required);
        recalc();
        qtySel.focus();
    });

    // Copy wallet address
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(addrEl.textContent.trim());
        } catch (e) {
            const range = document.createRange();
            range.selectNode(addrEl);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        }
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
        }, 1600);
    });

    // Confirmation
    confirm.addEventListener('click', () => {
        notice.classList.add('show');
        confirm.disabled = true;
        confirm.style.opacity = '0.65';
        confirm.style.cursor = 'default';
    });
})();
