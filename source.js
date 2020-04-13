
// Transform this Javascript code into a bookmarklet by using:
// https://bookmarklets.org/maker/


// Extract marketId
try {
    var chartLinks = document.querySelectorAll("button[market-id]");
    var bfaMarketId = chartLinks[0].getAttribute("market-id");
    if (!bfaMarketId) {
        throw "market-id not found";
    }
} catch(err) {
    console.log("BFA ERROR - " + err);
    return;
}


// Create toolbar
var bfaStakeFieldId = "bfa-stake";
if (!document.getElementById(bfaStakeFieldId)) {

    // Wrapper div
    var wrapper = document.createElement("DIV");
    wrapper.setAttribute("id", "bfa-wrapper");

    // Stake label
    var node = document.createElement("SPAN");
    node.setAttribute("style", "padding: 0 5px;");
    node.innerHTML = "BFA Stake:";
    wrapper.appendChild(node);

    // Stake input field
    var stake = window.localStorage.getItem("bfa-stake-stored");
    if (!stake) {
        stake = 2;
    }

    var node = document.createElement("INPUT");
    node.setAttribute("style", "width: 40px; padding: 0 5px;");
    node.setAttribute("type", "text");
    node.setAttribute("value", stake);
    node.setAttribute("id", bfaStakeFieldId);
    node.onchange = function() { window.localStorage.setItem("bfa-stake-stored", this.value); };
    node.onkeyup = function() { window.localStorage.setItem("bfa-stake-stored", this.value); };
    wrapper.appendChild(node);

    // Button to disable the bookmarklet
    // (unbind click listener from odds cells, delete wrapper div from DOM)
    var node = document.createElement("BUTTON");
    node.setAttribute("style", "margin-left: 5px; padding: 3px 10px; border: 0; background: #ccc; color: black;");
    node.innerHTML = "X";
    node.onclick = function() {
        var oddsCells = document.querySelectorAll("td[bet-selection-id]");
        for (var i=0; i<oddsCells.length; i++) {
            cell = oddsCells[i];
            cell.bfaAdded = false;
            cell.removeEventListener("click", bfaClickListener);
            this.parentElement.remove();
        }
    };
    wrapper.appendChild(node);

    // Add our wrapper div to Betfair market header
    try {
        var betfairMarketHeader = document.querySelectorAll(".mv-header-main-section-wrapper")[0];
        betfairMarketHeader.appendChild(wrapper);
    } catch(err) {
        console.log("BFA ERROR - " + err);
        return;
    }
}


// Bind our click listener function to each odds cell
var oddsCells = document.querySelectorAll("td[bet-selection-id]");
for (var i=0; i<oddsCells.length; i++) {

    var cell = oddsCells[i];
    if (cell.bfaAdded === true) {
        continue;
    }

    cell.bfaMarketId = bfaMarketId;
    cell.bfaSelectionId = cell.getAttribute("bet-selection-id");
    cell.bfaHandicap = cell.getAttribute("bet-handicap");
    cell.bfaStakeFieldId = bfaStakeFieldId;
    cell.bfaSide = null;

    if (cell.classList.contains("back-cell")) {
        cell.bfaSide = "BACK";
    } else if (cell.classList.contains("lay-cell")) {
        cell.bfaSide = "LAY";
    } else {
        continue;
    }

    cell.addEventListener("click", bfaClickListener);
    cell.bfaAdded = true;
}


// Click listener function
function bfaClickListener(event)
{
    var cell = event.currentTarget;

    try {
        var price = cell.querySelectorAll(".bet-button-price")[0].innerHTML;
    } catch(err) {
        console.log("BFA ERROR - " + err);
        return;
    }

    try {
        var stake = document.getElementById(cell.bfaStakeFieldId).value.trim();
        var isNumeric = !isNaN(parseFloat(stake)) && isFinite(stake);
        if (!isNumeric) {
            return;
        }
    } catch(err) {
        console.log("BFA ERROR - " + err);
        return;
    }

    var requestBody = [{
        "method": "ExchangeTransactional/v1.0/place",
        "params": {
            "marketId": cell.bfaMarketId,
            "instructions": [{
                "selectionId": cell.bfaSelectionId,
                "handicap": cell.bfaHandicap,
                "limitOrder": {
                    "size": stake,
                    "price": price,
                    "persistenceType": "LAPSE"
                },
                "orderType": "LIMIT",
                "side": cell.bfaSide
            }],
            "useAvailableBonus": false
        },
        "id": cell.bfaMarketId + "-plc",
        "jsonrpc": "2.0"
    }];

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://etx.betfair.com/www/etx-json-rpc?_ak=nzIFcwyWhrlwYMrh&alt=json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) {

            } else {
                console.log("BFA ERROR - " + xhr.responseText);
            }
        }

        try {
            var refreshMarket = document.querySelectorAll(".refresh-btn")[0];
            refreshMarket.click();
        } catch (err) {
            console.log("BFA ERROR - " + err);
        }

    };
    xhr.send(JSON.stringify(requestBody));        

    setTimeout(bfaClearBetslip, 500);
    setTimeout(bfaClearBetslip, 1000);
}


// Function to remove items from the "Place bets" betslip,
// as our click listener already placed the bet
function bfaClearBetslip() {
    var allButtons = document.querySelectorAll("button");
    for (var i=0; i<allButtons.length; i++) {
        var button = allButtons[i];
        if (button.innerHTML == "Cancel all selections") {
            button.click();
        }
    }            
}
