javascript:void%20function(){function%20e(e){var%20a=e.currentTarget;try{var%20n=a.querySelectorAll(%22.bet-button-price%22)[0].innerHTML}catch(r){return%20void%20console.log(%22BFA%20ERROR%20-%20%22+r)}try{var%20i=document.getElementById(a.bfaStakeFieldId).value.trim(),o=!isNaN(parseFloat(i))%26%26isFinite(i);if(!o)return}catch(r){return%20void%20console.log(%22BFA%20ERROR%20-%20%22+r)}var%20c=[{method:%22ExchangeTransactional/v1.0/place%22,params:{marketId:a.bfaMarketId,instructions:[{selectionId:a.bfaSelectionId,handicap:a.bfaHandicap,limitOrder:{size:i,price:n,persistenceType:%22LAPSE%22},orderType:%22LIMIT%22,side:a.bfaSide}],useAvailableBonus:!1},id:a.bfaMarketId+%22-plc%22,jsonrpc:%222.0%22}],l=new%20XMLHttpRequest;l.open(%22POST%22,%22https://etx.betfair.com/www/etx-json-rpc%3F_ak=nzIFcwyWhrlwYMrh%26alt=json%22),l.setRequestHeader(%22Content-Type%22,%22application/json%22),l.withCredentials=!0,l.onreadystatechange=function(){l.readyState===XMLHttpRequest.DONE%26%26(0===l.status||l.status%3E=200%26%26l.status%3C400||console.log(%22BFA%20ERROR%20-%20%22+l.responseText));try{var%20e=document.querySelectorAll(%22.refresh-btn%22)[0];e.click()}catch(t){console.log(%22BFA%20ERROR%20-%20%22+t)}},l.send(JSON.stringify(c)),setTimeout(t,500),setTimeout(t,1e3)}function%20t(){for(var%20e=document.querySelectorAll(%22button%22),t=0;t%3Ce.length;t++){var%20a=e[t];%22Cancel%20all%20selections%22==a.innerHTML%26%26a.click()}}try{var%20a=document.querySelectorAll(%22button[market-id]%22),n=a[0].getAttribute(%22market-id%22);if(!n)throw%22market-id%20not%20found%22}catch(r){return%20void%20console.log(%22BFA%20ERROR%20-%20%22+r)}var%20i=%22bfa-stake%22;if(!document.getElementById(i)){var%20o=document.createElement(%22DIV%22);o.setAttribute(%22id%22,%22bfa-wrapper%22);var%20c=document.createElement(%22SPAN%22);c.setAttribute(%22style%22,%22padding:%200%205px;%22),c.innerHTML=%22BFA%20Stake:%22,o.appendChild(c);var%20l=window.localStorage.getItem(%22bfa-stake-stored%22);l||(l=2);var%20c=document.createElement(%22INPUT%22);c.setAttribute(%22style%22,%22width:%2040px;%20padding:%200%205px;%22),c.setAttribute(%22type%22,%22text%22),c.setAttribute(%22value%22,l),c.setAttribute(%22id%22,i),c.onchange=function(){window.localStorage.setItem(%22bfa-stake-stored%22,this.value)},c.onkeyup=function(){window.localStorage.setItem(%22bfa-stake-stored%22,this.value)},o.appendChild(c);var%20c=document.createElement(%22BUTTON%22);c.setAttribute(%22style%22,%22margin-left:%205px;%20padding:%203px%2010px;%20border:%200;%20background:%20%23ccc;%20color:%20black;%22),c.innerHTML=%22X%22,c.onclick=function(){for(var%20t=document.querySelectorAll(%22td[bet-selection-id]%22),a=0;a%3Ct.length;a++)p=t[a],p.bfaAdded=!1,p.removeEventListener(%22click%22,e),this.parentElement.remove()},o.appendChild(c);try{var%20d=document.querySelectorAll(%22.mv-header-main-section-wrapper%22)[0];d.appendChild(o)}catch(r){return%20void%20console.log(%22BFA%20ERROR%20-%20%22+r)}}for(var%20s=document.querySelectorAll(%22td[bet-selection-id]%22),u=0;u%3Cs.length;u++){var%20p=s[u];if(p.bfaAdded!==!0){if(p.bfaMarketId=n,p.bfaSelectionId=p.getAttribute(%22bet-selection-id%22),p.bfaHandicap=p.getAttribute(%22bet-handicap%22),p.bfaStakeFieldId=i,p.bfaSide=null,p.classList.contains(%22back-cell%22))p.bfaSide=%22BACK%22;else{if(!p.classList.contains(%22lay-cell%22))continue;p.bfaSide=%22LAY%22}p.addEventListener(%22click%22,e),p.bfaAdded=!0}}}();