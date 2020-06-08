// 
// betfair-augmented.js - v2
// 
// For more information, please visit:
// https://github.com/trigvi/betfair-augmented
// 

(function betfairAugmented() {

    // If toolbar is there already: stop execution
    if (document.getElementById("bfa-toolbar")) {
        return;
    }

    // Create toolbar div
    var toolbar = document.createElement("DIV");
    toolbar.setAttribute("id", "bfa-toolbar");

    // Add button to toolbar: oneclick toggle
    var el = document.createElement("BUTTON");
    el.setAttribute("id", "bfa-oneclick-toggle");
    el.onclick = bfaOneclickToggle;
    toolbar.appendChild(el);

    // Add button to toolbar: direct/reverse toggle
    var el = document.createElement("BUTTON");
    el.setAttribute("id", "bfa-directreverse-toggle");
    el.onclick = bfaDirectreverseToggle;
    toolbar.appendChild(el);

    // Add field to toolbar: stake
    var el = document.createElement("SPAN");
    el.setAttribute("id", "bfa-stake-label");
    el.innerHTML = "Stake:";
    toolbar.appendChild(el);

    var el = document.createElement("INPUT");
    el.setAttribute("id", "bfa-stake");
    el.setAttribute("type", "text");
    el.setAttribute("value", (window.localStorage.getItem("bfaDefaultStake") || 2));
    el.onchange = function() { window.localStorage.setItem("bfaDefaultStake", this.value); };
    el.onkeyup = function() { window.localStorage.setItem("bfaDefaultStake", this.value); };
    toolbar.appendChild(el);

    // Define css
    var style = document.createElement("STYLE");
    style.innerHTML = "#bfa-toolbar { background: #eee; margin-bottom: 5px; padding: 8px 10px; } \n";
    style.innerHTML += "#bfa-toolbar button { outline: none; min-width: 100px; margin-right: 20px; padding: 5px 10px; border: 0; background: #ddd; color: black; border-radius: 5px; } \n";
    style.innerHTML += "#bfa-stake-label { display: inline-block; padding: 0 5px; } \n";
    style.innerHTML += "#bfa-stake { width: 40px; padding: 2px; border: 0; } \n";
    style.innerHTML += "\n";
    style.innerHTML += ".bfa-oneclick-on { background: #ffb80c !important; }\n";
    style.innerHTML += ".bfa-oneclick-on button { background: #e3a610 !important; }\n";
    style.innerHTML += ".bfa-oneclick-on #bfa-oneclick-toggle { font-weight: bold; }\n";
    style.innerHTML += "\n";
    style.innerHTML += ".bfa-hidden { display: none; }\n";

    // Insert toolbar/css into the DOM
    try {
        var bfContainer = document.querySelectorAll("bf-sports-header")[0];
        bfContainer.insertBefore(style, null);
        bfContainer.insertBefore(toolbar, null);
    } catch(err) {
        console.log("BFA ERROR - " + err);
        return;
    }

    // Turn on oneclick
    toolbar.marketId = bfaGetMarketId();
    bfaOneclickEnable(true);

    // Detect user switching market and apply toolbar
    // settings to the new market
    var intervalId = setInterval(function(){

        var toolbar = document.getElementById("bfa-toolbar");
        if (toolbar == null || typeof toolbar == "undefined") {
            clearInterval(intervalId);
            return;
        }

        if (bfaGetMarketId() != toolbar.marketId) {
            toolbar.marketId = bfaGetMarketId();
            bfaOneclickRefresh();
            bfaDirectreverseRefresh();
        }
    }, 1000);


    //------------------------------------------------

    function bfaOneclickEnable(forceDirect=false) {

        var toolbar = document.getElementById("bfa-toolbar");
        var oneclickBtn = document.getElementById("bfa-oneclick-toggle");
        var directreverseBtn = document.getElementById("bfa-directreverse-toggle");
        var oddsCells = document.querySelectorAll("td[bet-selection-id]");

        // Update toolbar
        oneclickBtn.innerHTML = "One-click ON";
        toolbar.classList.add("bfa-oneclick-on");
        directreverseBtn.classList.remove("hidden");

        // Bind oneclick listener to odds cells
        for (var i=0; i<oddsCells.length; i++) {
            var cell = oddsCells[i];
            if (cell.bfaAdded != true) {
                cell.bfaAdded = true;
                cell.addEventListener("click", bfaOneclickListener);
            }
        }

        // Set "Direct" betting
        if (forceDirect) {
            bfaDirectreverseToggle(null, true);
        }

    }


    //------------------------------------------------

    function bfaOneclickDisable() {

        var toolbar = document.getElementById("bfa-toolbar");
        var oneclickBtn = document.getElementById("bfa-oneclick-toggle");
        var directreverseBtn = document.getElementById("bfa-directreverse-toggle");
        var oddsCells = document.querySelectorAll("td[bet-selection-id]");

        // Update toolbar
        oneclickBtn.innerHTML = "One-click OFF";
        toolbar.classList.remove("bfa-oneclick-on");
        directreverseBtn.classList.add("hidden");

        // Unbind oneclick listener from odds cells
        for (var i=0; i<oddsCells.length; i++) {
            var cell = oddsCells[i];
            cell.bfaAdded = false;
            cell.removeEventListener("click", bfaOneclickListener);
        }

        // Force "Direct" betting, as when we disable
        // one-click we're basically restoring Betfair
        // default functionality, which doesn't
        // support "Reverse"
        bfaDirectreverseToggle(null, true);

    }


    //------------------------------------------------

    function bfaOneclickToggle() {

        var toolbar = document.getElementById("bfa-toolbar");
        if (toolbar.classList.contains("bfa-oneclick-on")) {
            bfaOneclickDisable();
        } else {
            bfaOneclickEnable();
        }

    }


    //------------------------------------------------

    function bfaOneclickRefresh() {

        var toolbar = document.getElementById("bfa-toolbar");
        if (toolbar.classList.contains("bfa-oneclick-on")) {
            bfaOneclickEnable();
        } else {
            bfaOneclickDisable();
        }

    }


    //------------------------------------------------

    function bfaOneclickListener(event) {

        var cell = event.currentTarget;

        try {
            var price = cell.querySelectorAll(".bet-button-price")[0].innerHTML;
        } catch(err) {
            console.log("BFA ERROR - " + err);
            return;
        }

        try {
            var stake = document.getElementById("bfa-stake").value.trim();
            var isNumeric = !isNaN(parseFloat(stake)) && isFinite(stake);
            if (!isNumeric) {
                return;
            }
        } catch(err) {
            console.log("BFA ERROR - " + err);
            return;
        }

        var marketId = bfaGetMarketId();
        var selectionId = cell.getAttribute("bet-selection-id");
        var handicap = cell.getAttribute("bet-handicap");
        var isDirect = bfaIsDirect();
        var side = null;

        if (cell.classList.contains("back-cell")) {
            side = (isDirect) ? "BACK" : "LAY";
        } else if (cell.classList.contains("lay-cell")) {
            side = (isDirect) ? "LAY" : "BACK";
        } else {
            return;
        }

        bfaPlaceBetAnyStake(marketId, selectionId, handicap, stake, price, side);
        setTimeout(bfaClearBetslip, 500);
        setTimeout(bfaClearBetslip, 2000);

    }


    //------------------------------------------------

    function bfaDirectreverseToggle(event, forceDirect=false) {

        var button = document.getElementById("bfa-directreverse-toggle");

        // Toggle button
        if (!button.classList.contains("bfa-direct") || forceDirect) {
            button.innerHTML = "Direct";
            button.classList.add("bfa-direct");

        } else {
            button.innerHTML = "Reverse";
            button.classList.remove("bfa-direct");
        }

        bfaDirectreverseRefresh()

    }


    //------------------------------------------------

    function bfaDirectreverseRefresh() {

        var button = document.getElementById("bfa-directreverse-toggle");
        if (button.classList.contains("bfa-direct")) {
            bfaSetCellColours(true);
        } else {
            bfaSetCellColours(false);
        }

    }


    //------------------------------------------------

    function bfaClearBetslip() {

        var allButtons = document.querySelectorAll("button");
        for (var i=0; i<allButtons.length; i++) {
            var button = allButtons[i];
            if (button.innerHTML == "Cancel all selections") {
                button.click();
            }
        }            

    }


    //------------------------------------------------

    function bfaGetMarketId() {

        try {
            var chartLinks = document.querySelectorAll("button[market-id]");
            var marketId = chartLinks[0].getAttribute("market-id");
            if (!marketId) {
                throw "market-id not found";
            }
        } catch(err) {
            console.log("BFA ERROR - " + err);
            return;
        }

        return marketId;

    }


    //------------------------------------------------

    function bfaIsDirect() {

        var button = document.getElementById("bfa-directreverse-toggle");
        return button.classList.contains("bfa-direct");

    }


    //------------------------------------------------

    function bfaSetCellColours(isDirect=true) {

        var backCells = document.querySelectorAll(".back-button");
        var layCells = document.querySelectorAll(".lay-button");

        for (var i=0; i<backCells.length; i++) {
            var cell = backCells[i];
            var depth = cell.getAttribute("depth");
            if (depth == "0") {
                cell.classList.remove("lay-selection-button");
                cell.classList.remove("back-selection-button");
                if (isDirect) {
                    cell.classList.add("back-selection-button");
                } else {
                    cell.classList.add("lay-selection-button");                
                }
            }
        }

        for (var i=0; i<layCells.length; i++) {
            var cell = layCells[i];
            var depth = cell.getAttribute("depth");
            if (depth == "0") {
                cell.classList.remove("lay-selection-button");
                cell.classList.remove("back-selection-button");
                if (isDirect) {
                    cell.classList.add("lay-selection-button");
                } else {
                    cell.classList.add("back-selection-button");                
                }
            }
        }

    }


    //------------------------------------------------

    async function bfaPlaceBetAnyStake(marketId, selectionId, handicap, stake, price, side) {

        var payout = stake * (price - 1);

        if (stake >= 2 || payout >= 10) {
            bfaPlaceBet(marketId, selectionId, handicap, stake, price, side);

        } else if (side == "BACK") {
            var betIdStake2 = await bfaPlaceBet(marketId, selectionId, handicap, 2, 1000, side);
            var betIdStakeOther = await bfaPlaceBet(marketId, selectionId, handicap, stake, 1000, side);
            bfaUpdateBet(marketId, betIdStakeOther, price);
            bfaCancelBet(marketId, betIdStake2);
       
        } else if (side == "LAY") {
            var betIdStake2 = await bfaPlaceBet(marketId, selectionId, handicap, 2, 1.01, side);
            var betIdStakeOther = await bfaPlaceBet(marketId, selectionId, handicap, stake, 1.01, side);
            bfaUpdateBet(marketId, betIdStakeOther, price);
            bfaCancelBet(marketId, betIdStake2);
        }

        document.querySelectorAll(".refresh-btn")[0].click();

    }


    //------------------------------------------------

    async function bfaPlaceBet(marketId, selectionId, handicap, stake, price, side) {

        var requestBody = [{
            "method": "ExchangeTransactional/v1.0/place",
            "params": {
                "marketId": marketId,
                "instructions": [{
                    "selectionId": selectionId,
                    "handicap": handicap,
                    "limitOrder": {
                        "size": stake,
                        "price": price,
                        "persistenceType": "LAPSE"
                    },
                    "orderType": "LIMIT",
                    "side": side
                }],
                "useAvailableBonus": false
            },
            "id": marketId + "-plc",
            "jsonrpc": "2.0"
        }];

        var responseBody = await bfaRpc("POST", requestBody);

        try {
            return responseBody[0].result.instructionReports[0].betId;
        } catch (err) {}

    }


    //------------------------------------------------

    async function bfaUpdateBet(marketId, betId, newPrice) {

        var requestBody = [{
            "method": "ExchangeTransactional/v1.0/replace",
            "params": {
                "marketId": marketId,
                "instructions": [{
                    "betId": betId,
                    "newPrice": newPrice
                }],
            },
            "id": marketId + "-rpl",
            "jsonrpc": "2.0"
        }];

        var responseBody = await bfaRpc("POST", requestBody);

        try {
            return responseBody[0].result.instructionReports[0].placeInstructionReport.betId;
        } catch (err) {}

    }


    //------------------------------------------------

    async function bfaCancelBet(marketId, betId) {

        var requestBody = [{
            "method": "ExchangeTransactional/v1.0/cancel",
            "params": {
                "marketId": marketId,
                "instructions": [{
                    "betId": betId
                }],
            },
            "id": marketId + "-cnl",
            "jsonrpc": "2.0"
        }];

        await bfaRpc("POST", requestBody);

    }


    //------------------------------------------------

    async function bfaRpc(method, requestBody=[]) {

        try {

            var response = await fetch("https://etx.betfair.com/www/etx-json-rpc?_ak=nzIFcwyWhrlwYMrh&alt=json", {
                method: method,
                body: JSON.stringify(requestBody),
                credentials: "include",
            })

            var responseBody = await response.json();
            if (response.status !== 0) {
                if (response.status < 200 || response.status >= 400) {
                    console.log("BFA ERROR - " + responseBody);
                    return;
                }
            }

            return responseBody;
    
        } catch (err) {
            console.log("BFA ERROR - " + err);
            return;
        }

    }


})();
