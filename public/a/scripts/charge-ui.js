const CoinpushCharge=(()=>{class e{static fiatToSymbol(e){return{gbp:"&pound;",eur:"&euro;",usd:"&dollar;"}[e]}static currencyToChain(e){return{btc:"bitcoin",bch:"bitcoin-cash",ltc:"litecoin"}[e]}static chainToReadable(e){return(e=e.replace(/-/g," ")).toLowerCase().split(" ").map(e=>e.charAt(0).toUpperCase()+e.substring(1)).join(" ")}static addressToQrValue(e){return e.chain.replace(/-/g,"")+":"+e.deposit_address+"?amount="+this.satsToFloat(e.expected_amount)}static satsToFloat(e){return e<=0?0:parseFloat(e/1e8)}}class t{static getName(){return"coinpush.io"}static getUrl(){return"https://coinpush.io"}static getDevUrl(){return"http://coinpush.test"}static getApiUrl(){return this.getUrl()+"/api"}static getApiDevUrl(){return this.getDevUrl()+"/api"}static getApiTestnetUrl(){return this.getApiUrl()+"/testnet"}static getApiDevTestnetUrl(){return this.getApiDevUrl()+"/testnet"}static getQrCodeUrl(e){return this.getUrl()+"/a/qr/"+e}static getImageUrl(e){return this.getUrl()+"/a/images/"+e+".svg"}static getChargePath(e){return"/charge/"+e}static getCreatePath(e){return"/create/"+e}}class s{constructor(e){this.intervals=e,this.countdowns={}}flush(e){Object.keys(this.countdowns).forEach(e=>{this.intervals.forget(e),delete this.countdowns[e]})}start(e,t,s,a){this.intervals.has(e)&&this.intervals.forget(e),this.countdowns[e]=!0,this.intervals.set(e,()=>{let i=Math.floor((new Date).getTime()/1e3),n=t-i;if(n>=0){parseInt(n/86400);n%=86400;parseInt(n/3600);n%=3600;let e=parseInt(n/60);n%=60;let t=parseInt(n);s(("0"+e).slice(-2),("0"+t).slice(-2))}else a(),this.intervals.forget(e),delete this.countdowns[e]},1e3)}}class a{constructor(e){this.ids={base:"cp-modal",inner:"cp-modal-inner",content:"cp-modal-content",status:"cp-status",close:"cp-modal-close"},this.notices={select:"Select a cryptocurrency to pay with",refresh:"Please refresh the page and try again."},this.countdowns=e,this.boot()}boot(){document.onkeydown=(e=>{let t=!1;(t="key"in(e=e||window.event)?"Escape"===e.key||"Esc"===e.key:27===e.keyCode)&&this.isOpen()&&this.hide()})}isOpen(){return null!==document.getElementById(this.ids.base)}statusIsVisible(){return null!==document.getElementById(this.ids.status)}makeElem(e,t,s){let a=document.createElement(e);return t=t||{},Object.keys(t).forEach(e=>{null!==t[e]&&a.setAttribute(e,t[e])}),s&&(a.innerHTML=s),a}makeBase(){let e=this.makeElem("div",{id:this.ids.base}),s=this.makeElem("a",{href:t.getUrl(),target:"_blank"},t.getName());return e.appendChild(this.makeElem("div",{id:"cp-link"},"Powered by "+s.outerHTML)),e}makeInner(){return this.makeElem("div",{id:this.ids.inner})}makeContent(){return this.makeElem("div",{id:this.ids.content})}makeClose(){let e=this.makeElem("div",{id:this.ids.close},"&times;");return e.addEventListener("click",e=>{this.hide()}),e}makeLoading(){let e=this.makeElem("div",{class:"cp-tac"});return e.appendChild(this.makeElem("img",{id:"cp-loading",alt:"loading...",src:t.getImageUrl("loading")})),e}makeSection(e,t){return this.makeElem("div",{class:"cp-section cp-clear "+e},t)}makePanel(e,t){return this.makeElem("div",{class:"cp-panel cp-clear "+e},t)}makeStatus(e,t){return this.makeElem("div",{id:this.ids.status,class:e},t)}makeTextInput(e,t){return this.makeElem("input",{spellcheck:"false",class:e,value:t})}makeMenuButton(e,s){let a=this.makeElem("img",{class:"cp-list",alt:"menu",src:t.getImageUrl("menu")});return a.addEventListener("click",t=>{t.preventDefault(),s.selectCharge(e.button)}),a}makeWalletLink(s){let a=e.addressToQrValue(s),i=t.getQrCodeUrl(a),n=this.makeElem("a",{href:a});return n.appendChild(this.makeElem("img",{class:"cp-qr",alt:"qr",src:i})),n.appendChild(this.makeElem("span",{class:"cp-small"},"Open wallet")),n}makeSendingFields(t,s){let a=this.makeElem("div"),i="<span>Pay</span> "+e.fiatToSymbol(t.fiat)+t.amount.toFixed(2)+" <span>using</span> "+e.chainToReadable(s.chain),n=e.satsToFloat(s.expected_amount);return a.appendChild(this.makeElem("p",{},i)),a.appendChild(this.makeElem("label",{},"Send")),a.appendChild(this.makeTextInput(null,n)),a.appendChild(this.makeElem("label",{},"To")),a.appendChild(this.makeTextInput(null,s.deposit_address)),a}makeChargeDetails(e,s,a){let i=this.makeSection("cp-details"),n=this.makePanel(),l=this.makePanel("cp-right");return n.appendChild(this.makeMenuButton(s,a)),n.appendChild(this.makeElem("span",{},"&nbsp;<span>&#x203A;</span>&nbsp;")),n.appendChild(this.makeElem("img",{class:"cp-chain",alt:e,src:t.getImageUrl(e)})),l.appendChild(this.makeStatus(null,"Waiting for payment...")),i.appendChild(n),i.appendChild(l),i}makeExpiryCountdown(e,t,s,a){let i=this.makeElem("div",{id:"cp-expires"}),n=this.makeElem("div",{class:"cp-small"},"expires in:"),l=this.makeElem("div",{class:"cp-small cp-time"},"--:--"),r=t.button.dataset.token,h=e+":"+r+":"+s.deposit_address;return i.appendChild(n),i.appendChild(l),this.countdowns.start(h,s.expires_unix,(e,t)=>{l.innerHTML=e+":"+t},()=>{a.makeChargeWith(e,t)}),i}makeChargeOrders(e,t,s,a){let i=this.makeSection("cp-orders"),n=this.makePanel("cp-s1s4 cp-tac cp-border"),l=this.makePanel("cp-s3s4 cp-border");return n.appendChild(this.makeWalletLink(s)),n.appendChild(this.makeExpiryCountdown(e,t,s,a)),l.appendChild(this.makeSendingFields(t,s)),i.appendChild(n),i.appendChild(l),i}appendContent(e){let t=document.getElementById(this.ids.content);return null!==t&&(t.appendChild(e),!0)}clearContent(){let e=document.getElementById(this.ids.content);return null!==e&&(e.innerHTML="",!0)}updateStatus(e){let t=document.getElementById(this.ids.status);return null!==t&&(t.innerHTML=e,!0)}show(){if(null===document.getElementById(this.ids.base)){let e=this.makeBase(),t=this.makeInner(),s=this.makeClose(),a=this.makeContent();return e.appendChild(s),t.appendChild(a),e.appendChild(t),document.body.appendChild(e),!0}return!1}showError(e,t,s){let a=this.makeSection("cp-tac"),i="Status: <span>"+t+"</span>";a.appendChild(this.makeElem("p",{},i)),e.message&&e.message.length>0&&a.appendChild(this.makeElem("p",{},e.message)),"error"==s&&a.appendChild(this.makeElem("p",{},this.notices.refresh)),this.show(),this.clearContent(),this.appendContent(a)}showSelectCharge(s,a){let i=this.makeSection(),n=this.makeSection("cp-details cp-tac",this.notices.select);s.accept.forEach(n=>{let l=this.makeElem("button",{class:"cp-button cp-currency"});l.appendChild(this.makeElem("img",{class:"cp-chain",alt:n,src:t.getImageUrl(n)})),l.appendChild(this.makeElem("span",{},"&nbsp;&nbsp;"+e.chainToReadable(e.currencyToChain(n)))),l.addEventListener("click",()=>{a(n,s)}),i.appendChild(l)}),this.show(),this.clearContent(),this.appendContent(n),this.appendContent(i)}showCharge(e,t,s,a){this.show(),this.clearContent(),this.appendContent(this.makeChargeDetails(e,t,a)),this.appendContent(this.makeChargeOrders(e,t,s,a))}showAwaitingConfirmation(e){let s=this.makeSection("cp-tac");s.appendChild(this.makeElem("img",{class:"cp-status",alt:"success",src:t.getImageUrl("timer")})),s.appendChild(this.makeElem("h1",{},"Payment Recieved!")),s.appendChild(this.makeElem("p",{},"Waiting for 1 confirmation...")),e&&s.appendChild(this.makeElem("p",{},e)),this.show(),this.clearContent(),this.appendContent(s)}showPaymentAccepted(e){let s=this.makeSection("cp-tac");s.appendChild(this.makeElem("img",{class:"cp-status",alt:"success",src:t.getImageUrl("tick")})),s.appendChild(this.makeElem("h1",{},"Payment accepted!")),e&&s.appendChild(this.makeElem("p",{},e)),this.show(),this.clearContent(),this.appendContent(s)}hide(){this.countdowns.flush();let e=document.getElementById(this.ids.base);return null!==e&&(e.parentNode.removeChild(e),!0)}}class i{constructor(){this.listeners=[]}has(e){return void 0!==this.listeners[e]}get(e){return this.listeners[e]}set(e,t,s){this.listeners[e]={type:t,callback:s}}shed(e){let t=this.listeners[e];return delete this.listeners[e],t}}class n{constructor(){this.intervals={}}has(e){return void 0!==this.intervals[e]}set(e,t,s){this.intervals[e]=setInterval(t,s)}forget(e){this.has(e)&&clearInterval(this.intervals[e]),delete this.intervals[e]}flush(){Object.keys(this.intervals).forEach(e=>{this.forget(e)})}}class l{constructor(e){this.modal=e,this.timeout=1e4,this.async=!0,this.devMode=!1,this.testnet=!1}isUsingDevMode(){return this.devMode}isUsingTestnet(){return this.testnet}enableDevMode(){return this.devMode=!0,this}useTestnet(){return this.testnet=!0,this}useMainnet(){return this.testnet=!1,this}makeUrl(e){let s=this.testnet?t.getApiTestnetUrl():t.getApiUrl();return this.isUsingDevMode()&&(s=this.testnet?t.getApiDevTestnetUrl():t.getApiDevUrl()),s+e}make(e,t,s,a,i,n){let l=new XMLHttpRequest,r=this.makeUrl(s),h=new FormData;Object.keys(a).forEach(e=>{h.append(e,a[e])}),l.timeout=this.timeout,l.onloadstart=(()=>{e&&(this.modal.clearContent(),this.modal.appendContent(this.modal.makeLoading()))}),l.onload=(()=>{let t=l.responseText,s=t.length>0?JSON.parse(t):{};l.status>=200&&l.status<300?i(s,l.statusText):n?n(s,l.statusText):e&&this.modal.showError(s,l.statusText)}),l.onerror=(()=>{n?n({},l.statusText):e&&this.modal.showError({},l.statusText,"error")}),l.ontimeout=(()=>{n?n({},"Request timeout"):e&&this.modal.showError({},"Request timeout")}),l.open(t,r,this.async),l.send(h)}}return class{constructor(e){this.buttons=e,this.intervals=new n,this.countdowns=new s(this.intervals),this.modal=new a(this.countdowns),this.requester=new l(this.modal),this.listeners=new i,this.callbacks={},this.ranTokenCallbacks=[],this.activeAddresses={},this.boot()}boot(){this.listeners.set("selectCharge","click",e=>{this.selectCharge(e.target)});for(let e of this.buttons){let t=this.listeners.get("selectCharge");e.addEventListener(t.type,t.callback)}this.pushCallback("balance_insufficient",(e,t)=>{this.modal.updateStatus("Please send the full amount...")}),this.pushCallback("balance_sufficient",(e,t)=>{this.countdowns.flush()})}destroy(){for(let e of this.buttons){let t=this.listeners.shed("selectCharge");e.removeEventListener(t.type,t.callback)}this.buttons=[],this.callbacks={},this.ranTokenCallbacks=[],this.activeAddresses={},this.countdowns.flush(),this.intervals.flush()}on(e,t){return this.pushCallback(e,t),this}hasCallbacks(e){return Array.isArray(this.callbacks[e])}pushCallback(e,t){this.hasCallbacks(e)||(this.callbacks[e]=[]),this.callbacks[e].push(t)}hasRanTokenCallbacks(e){return this.ranTokenCallbacks.includes(e)}pushRanTokenCallbacks(e){this.ranTokenCallbacks.push(e)}runCallback(e,t,s){let a=t.button.dataset.token,i=e.status+":"+a;this.hasCallbacks(e.status)&&(this.hasRanTokenCallbacks(i)&&!s||this.callbacks[e.status].forEach(s=>{s(e,t)}),this.hasRanTokenCallbacks(i)||s||this.pushRanTokenCallbacks(i))}stopListening(e){this.intervals.forget(e)}setActiveAddress(e,t,s){let a=e+":"+t;this.activeAddresses[a]=s}getActiveAddress(e,t){let s=e+":"+t;return this.activeAddresses[s]}hasActiveAddress(e,t){let s=e+":"+t;if(void 0===this.activeAddresses[s])return!1;let a=this.activeAddresses[s].expires_unix;return Math.floor((new Date).getTime()/1e3)<a}hasNotPaid(e){return!(e=e.map(e=>e.status)).includes("balance_sufficient")}selectCharge(e){let s=e.dataset.token,a=t.getChargePath(s);this.modal.show(),this.countdowns.flush(),this.requester.make(!0,"GET",a,{},t=>{let s={button:e,fiat:t.results.charge.fiat,amount:t.results.charge.amount,accept:Object.keys(t.results.charge.accept)};this.modal.showSelectCharge(s,(e,t)=>{this.makeChargeWith(e,t)})})}updateChargeStatus(e,s,a){let i=e.button.dataset.token,n=t.getChargePath(i);this.requester.make(!1,"GET",n,{},t=>{let i=t.results.statuses;if(this.intervals.has(e.button.dataset.token)||this.intervals.set(e.button.dataset.token,()=>{this.updateChargeStatus(e,!1)},1e4),i.length){let t=i[0];this.runCallback(t,e,s)}this.hasNotPaid(i)&&a instanceof Function&&a(i)})}makeChargeWith(e,s){let a=t.getCreatePath(e),i=s.button.dataset.token,n={charge_token:i};this.updateChargeStatus(s,!0,t=>{if(this.hasActiveAddress(e,i)){let t=this.getActiveAddress(e,i);this.modal.clearContent(),this.modal.showCharge(e,s,t,this)}else this.requester.make(!0,"POST",a,n,t=>{let a=t.results.address;this.setActiveAddress(e,i,a),this.modal.showCharge(e,s,a,this)})})}}})();