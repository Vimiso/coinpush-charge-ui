const CoinpushCharge = (() => {

// -----------------------------------------------

class Converter
{
    static fiatToSymbol(fiat)
    {
        let fiats = {
            gbp: '&pound;',
            eur: '&euro;',
            usd: '&dollar;'
        }

        return fiats[fiat]
    }

    static currencyToChain(currency)
    {
        let chains = {
            btc: 'bitcoin',
            bch: 'bitcoin-cash',
            ltc: 'litecoin'
        }

        return chains[currency]
    }

    static chainToReadable(chain)
    {
        chain = chain.replace(/-/g, ' ')

        return chain.toLowerCase()
            .split(' ')
            .map((str) => {
                return str.charAt(0).toUpperCase() + str.substring(1)
            })
            .join(' ')
    }

    static addressToQrValue(address)
    {
        return address.chain.replace(/-/g, '')
            + ':'
            + address.deposit_address
            + '?amount='
            + this.satsToFloat(address.expected_amount)
    }

    static satsToFloat(sats)
    {
        if (sats <= 0) {
            return 0
        }

        return parseFloat(sats / 100000000)
    }
}

// -----------------------------------------------

class Site
{
    static getName()
    {
        return 'coinpush.io'
    }

    static getUrl()
    {
        return 'https://coinpush.io'
    }

    static getDevUrl()
    {
        return 'http://coinpush.test'
    }

    static getApiUrl()
    {
        return this.getUrl() + '/api'
    }

    static getApiDevUrl()
    {
        return this.getDevUrl() + '/api'
    }

    static getApiTestnetUrl()
    {
        return this.getApiUrl() + '/testnet'
    }

    static getApiDevTestnetUrl()
    {
        return this.getApiDevUrl() + '/testnet'
    }

    static getQrCodeUrl(value)
    {
        return this.getUrl() + '/a/qr/' + value
    }

    static getImageUrl(name)
    {
        return this.getUrl() + '/a/images/' + name + '.svg'
    }

    static getChargePath(token)
    {
        return '/charge/' + token
    }

    static getCreatePath(currency)
    {
        return '/create/' + currency
    }
}

// -----------------------------------------------

class Countdown
{
    constructor(intervals)
    {
        this.intervals = intervals
        this.countdowns = {}
    }

    flush(key)
    {
        Object.keys(this.countdowns).forEach((key) => {
            this.intervals.forget(key)

            delete this.countdowns[key]
        })
    }

    start(key, endUnix, progressCallback, finishedCallback)
    {
        if (this.intervals.has(key)) {
            this.intervals.forget(key)
        }

        this.countdowns[key] = true
        this.intervals.set(key, () => {
            let startUnix = Math.floor(new Date().getTime() / 1000)
            let timeRemaining = endUnix - startUnix

            if (timeRemaining >= 0) {
                let days = parseInt(timeRemaining / 86400)
                timeRemaining = (timeRemaining % 86400)

                let hours = parseInt(timeRemaining / 3600)
                timeRemaining = (timeRemaining % 3600)

                let mins = parseInt(timeRemaining / 60)
                timeRemaining = (timeRemaining % 60)

                let secs = parseInt(timeRemaining)

                progressCallback(
                    ('0' + mins).slice(-2),
                    ('0' + secs).slice(-2)
                )
            } else {
                finishedCallback()

                this.intervals.forget(key)

                delete this.countdowns[key]
            }
        }, 1000)
    }
}

// -----------------------------------------------

class Modal
{
    constructor(countdowns)
    {
        this.ids = {
            base: 'cp-modal',
            inner: 'cp-modal-inner',
            content: 'cp-modal-content',
            status: 'cp-status',
            close: 'cp-modal-close'
        }
        this.notices = {
            select: 'Select a cryptocurrency to pay with',
            refresh: 'Please refresh the page and try again.'
        }
        this.countdowns = countdowns
        this.boot()
    }

    boot()
    {
        document.onkeydown = (event) => {
            event = event || window.event

            let isEscKey = false

            if ('key' in event) {
                isEscKey = event.key === 'Escape' || event.key === 'Esc'
            } else {
                isEscKey = event.keyCode === 27
            }

            if (isEscKey && this.isOpen()) {
                this.hide()
            }
        }
    }

    isOpen()
    {
        return document.getElementById(this.ids.base) !== null
    }

    statusIsVisible()
    {
        return document.getElementById(this.ids.status) !== null
    }

    makeElem(type, attrs, html) {
        let elem = document.createElement(type)

        attrs = ! attrs ? {} : attrs

        Object.keys(attrs).forEach((key) => {
            if (attrs[key] !== null) {
                elem.setAttribute(key, attrs[key])
            }
        })

        if (html) {
            elem.innerHTML = html
        }

        return elem
    }

    makeBase()
    {
        let wrap = this.makeElem('div', {id: this.ids.base})
        let link = this.makeElem('a', {
            href: Site.getUrl(),
            target: '_blank'
        }, Site.getName())

        wrap.appendChild(
            this.makeElem('div', {id: 'cp-link'}, 'Powered by ' + link.outerHTML)
        )

        return wrap
    }

    makeInner()
    {
        return this.makeElem('div', {id: this.ids.inner})
    }

    makeContent()
    {
        return this.makeElem('div', {id: this.ids.content})
    }

    makeClose()
    {
        let elem = this.makeElem('div', {id: this.ids.close}, '&times;')

        elem.addEventListener('click', (e) => {
            this.hide()
        })

        return elem
    }

    makeLoading()
    {
        let wrap = this.makeElem('div', {class: 'cp-tac'})

        wrap.appendChild(
            this.makeElem('img', {
                id: 'cp-loading',
                alt: 'loading...',
                src: Site.getImageUrl('loading')
            })
        )

        return wrap
    }

    makeSection(classes, html)
    {
        return this.makeElem('div', {class: 'cp-section cp-clear ' + classes}, html)
    }

    makePanel(classes, html)
    {
        return this.makeElem('div', {class: 'cp-panel cp-clear ' + classes}, html)
    }

    makeStatus(classes, html)
    {
        return this.makeElem('div', {id: this.ids.status, class: classes}, html)
    }

    makeTextInput(classes, value)
    {
        return this.makeElem('input', {
            spellcheck: 'false',
            class: classes,
            value: value
        })
    }

    makeMenuButton(charge, coinpush)
    {
        let wrap = this.makeElem('img', {
            class: 'cp-list',
            alt: 'menu',
            src: Site.getImageUrl('menu')
        })

        wrap.addEventListener('click', (event) => {
            event.preventDefault()

            coinpush.selectCharge(charge.button)
        })

        return wrap
    }

    makeWalletLink(address)
    {
        let qrVal = Converter.addressToQrValue(address)
        let qrUrl = Site.getQrCodeUrl(qrVal)
        let wrap = this.makeElem('a', {href: qrVal})

        wrap.appendChild(
            this.makeElem('img', {class: 'cp-qr', alt: 'qr', src: qrUrl})
        )
        wrap.appendChild(
            this.makeElem('span', {class: 'cp-small'}, 'Open wallet')
        )

        return wrap
    }

    makeSendingFields(charge, address)
    {
        let wrap = this.makeElem('div')
        let payHtml = '<span>Pay</span> '
            + Converter.fiatToSymbol(charge.fiat)
            + charge.amount.toFixed(2)
            + ' <span>using</span> '
            + Converter.chainToReadable(address.chain)
        let payAmount = Converter.satsToFloat(address.expected_amount)

        wrap.appendChild(this.makeElem('p', {}, payHtml))
        wrap.appendChild(this.makeElem('label', {}, 'Send'))
        wrap.appendChild(this.makeTextInput(null, payAmount))
        wrap.appendChild(this.makeElem('label', {}, 'To'))
        wrap.appendChild(this.makeTextInput(null, address.deposit_address))

        return wrap
    }

    makeChargeDetails(currency, charge, coinpush)
    {
        let wrap = this.makeSection('cp-details')
        let left = this.makePanel()
        let right = this.makePanel('cp-right')

        left.appendChild(this.makeMenuButton(charge, coinpush))
        left.appendChild(
            this.makeElem('span', {}, '&nbsp;<span>&#x203A;</span>&nbsp;')
        )
        left.appendChild(
            this.makeElem('img', {
                class: 'cp-chain',
                alt: currency,
                src: Site.getImageUrl(currency)
            })
        )

        right.appendChild(
            this.makeStatus(null, 'Waiting for payment...')
        )

        wrap.appendChild(left)
        wrap.appendChild(right)

        return wrap
    }

    makeExpiryCountdown(currency, charge, address, coinpush)
    {
        let wrap = this.makeElem('div', {id: 'cp-expires'})
        let remaining = this.makeElem('div', {class: 'cp-small'}, 'expires in:')
        let countdown = this.makeElem('div', {class: 'cp-small cp-time'}, '--:--')
        let token = charge.button.dataset.token
        let key = currency + ":" + token + ":" + address.deposit_address

        wrap.appendChild(remaining)
        wrap.appendChild(countdown)

        this.countdowns.start(key, address.expires_unix, (mins, secs) => {
            countdown.innerHTML = mins + ':' + secs
        }, () => {
            coinpush.makeChargeWith(currency, charge)
        })

        return wrap
    }

    makeChargeOrders(currency, charge, address, coinpush)
    {
        let wrap = this.makeSection('cp-orders')
        let left = this.makePanel('cp-s1s4 cp-tac cp-border')
        let right = this.makePanel('cp-s3s4 cp-border')

        left.appendChild(this.makeWalletLink(address))
        left.appendChild(this.makeExpiryCountdown(currency, charge, address, coinpush))
        right.appendChild(this.makeSendingFields(charge, address))

        wrap.appendChild(left)
        wrap.appendChild(right)

        return wrap
    }

    appendContent(child)
    {
        let elem = document.getElementById(this.ids.content)

        if (elem !== null) {
            elem.appendChild(child)

            return true
        }

        return false
    }

    clearContent()
    {
        let elem = document.getElementById(this.ids.content)

        if (elem !== null) {
            elem.innerHTML = ''

            return true
        }

        return false
    }

    updateStatus(message)
    {
        let elem = document.getElementById(this.ids.status)

        if (elem !== null) {
            elem.innerHTML = message

            return true
        }

        return false
    }

    show()
    {
        let elem = document.getElementById(this.ids.base)

        if (elem === null) {
            let modal = this.makeBase()
            let inner = this.makeInner()
            let close = this.makeClose()
            let content = this.makeContent()

            modal.appendChild(close)
            inner.appendChild(content)
            modal.appendChild(inner)

            document.body.appendChild(modal)

            return true
        }

        return false
    }

    showError(response, statusText, type)
    {
        let section = this.makeSection('cp-tac')
        let statusHtml = 'Status: <span>' + statusText + '</span>'

        section.appendChild(this.makeElem('p', {}, statusHtml))

        if (response.message && response.message.length > 0) {
            section.appendChild(this.makeElem('p', {}, response.message))
        }

        if (type == 'error') {
            section.appendChild(this.makeElem('p', {}, this.notices.refresh))
        }

        this.show()
        this.clearContent()
        this.appendContent(section)
    }

    showSelectCharge(charge, callback)
    {
        let buttons = this.makeSection()
        let details = this.makeSection('cp-details cp-tac',  this.notices.select)

        charge.accept.forEach((currency) => {
            let button = this.makeElem('button', {
                class: 'cp-button cp-currency'
            })

            button.appendChild(
                this.makeElem('img', {
                    class: 'cp-chain',
                    alt: currency,
                    src: Site.getImageUrl(currency)
                })
            )
            button.appendChild(
                this.makeElem(
                    'span',
                    {},
                    '&nbsp;&nbsp;'
                        + Converter.chainToReadable(
                            Converter.currencyToChain(currency)
                        )
                )
            )
            button.addEventListener('click', () => {
                callback(currency, charge)
            })

            buttons.appendChild(button)
        })

        this.show()
        this.clearContent()
        this.appendContent(details)
        this.appendContent(buttons)
    }

    showCharge(currency, charge, address, coinpush)
    {
        this.show()
        this.clearContent()
        this.appendContent(this.makeChargeDetails(currency, charge, coinpush))
        this.appendContent(this.makeChargeOrders(currency, charge, address, coinpush))
    }

    showAwaitingConfirmation(message)
    {
        let section = this.makeSection('cp-tac')

        section.appendChild(
            this.makeElem('img', {
                class: 'cp-status',
                alt: 'success',
                src: Site.getImageUrl('timer')
            })
        )
        section.appendChild(this.makeElem('h1', {}, 'Payment Recieved!'))
        section.appendChild(this.makeElem('p', {}, 'Waiting for 1 confirmation...'))

        if (message) {
            section.appendChild(this.makeElem('p', {}, message))
        }

        this.show()
        this.clearContent()
        this.appendContent(section)
    }

    showPaymentAccepted(message)
    {
        let section = this.makeSection('cp-tac')

        section.appendChild(
            this.makeElem('img', {
                class: 'cp-status',
                alt: 'success',
                src: Site.getImageUrl('tick')
            })
        )
        section.appendChild(this.makeElem('h1', {}, 'Payment accepted!'))

        if (message) {
            section.appendChild(this.makeElem('p', {}, message))
        }

        this.show()
        this.clearContent()
        this.appendContent(section)
    }

    hide()
    {
        this.countdowns.flush()

        let elem = document.getElementById(this.ids.base)

        if (elem !== null) {
            elem.parentNode.removeChild(elem)

            return true
        }

        return false
    }
}

// -----------------------------------------------

class ElemListener
{
    constructor()
    {
        this.listeners = []
    }

    has(key)
    {
        return this.listeners[key] !== undefined
    }

    get(key)
    {
        return this.listeners[key]
    }

    set(key, type, callback)
    {
        this.listeners[key] = {type: type, callback: callback}
    }

    shed(key)
    {
        let listener = this.listeners[key]

        delete this.listeners[key]

        return listener
    }
}

// -----------------------------------------------

class Interval
{
    constructor()
    {
        this.intervals = {}
    }

    has(key)
    {
        return this.intervals[key] !== undefined
    }

    set(key, callback, interval)
    {
        this.intervals[key] = setInterval(callback, interval)
    }

    forget(key)
    {
        if (this.has(key)) {
            clearInterval(this.intervals[key])
        }

        delete this.intervals[key]
    }

    flush()
    {
        Object.keys(this.intervals).forEach((key) => {
            this.forget(key)
        })
    }
}

// -----------------------------------------------

class Requester
{
    constructor(modal)
    {
        this.modal = modal
        this.timeout = 10000
        this.async = true
        this.devMode = false
        this.testnet = false
    }

    isUsingDevMode()
    {
        return this.devMode
    }

    isUsingTestnet()
    {
        return this.testnet
    }

    enableDevMode()
    {
        this.devMode = true

        return this
    }

    useTestnet()
    {
        this.testnet = true

        return this
    }

    useMainnet()
    {
        this.testnet = false

        return this
    }

    makeUrl(path)
    {
        let base = ! this.testnet
            ? Site.getApiUrl()
            : Site.getApiTestnetUrl()

        if (this.isUsingDevMode()) {
            base = ! this.testnet
                ? Site.getApiDevUrl()
                : Site.getApiDevTestnetUrl()
        }

        return base + path
    }

    make(showModalLoading, method, path, params, success, failure)
    {
        let xhr = new XMLHttpRequest()
        let url = this.makeUrl(path)
        let data = new FormData()

        Object.keys(params).forEach((key) => {
            data.append(key, params[key])
        })

        xhr.timeout = this.timeout
        xhr.onloadstart = () => {
            if (showModalLoading) {
                this.modal.clearContent()
                this.modal.appendContent(this.modal.makeLoading())
            }
        }

        xhr.onload = () => {
            let text = xhr.responseText
            let response = text.length > 0 ? JSON.parse(text) : {}

            if (xhr.status >= 200 && xhr.status < 300) {
                success(response, xhr.statusText)
            } else {
                if (failure) {
                    failure(response, xhr.statusText)
                } else if (showModalLoading) {
                    this.modal.showError(response, xhr.statusText)
                }
            }
        }

        xhr.onerror = () => {
            if (failure) {
                failure({}, xhr.statusText)
            } else if (showModalLoading) {
                this.modal.showError({}, xhr.statusText, 'error')
            }
        }

        xhr.ontimeout = () => {
            let statusText = 'Request timeout'

            if (failure) {
                failure({}, statusText)
            } else if (showModalLoading) {
                this.modal.showError({}, statusText)
            }
        }

        xhr.open(method, url, this.async)
        xhr.send(data)
    }
}

// -----------------------------------------------

class Charge
{
    constructor(buttons)
    {
        this.buttons = buttons
        this.intervals = new Interval()
        this.countdowns = new Countdown(this.intervals)
        this.modal = new Modal(this.countdowns)
        this.requester = new Requester(this.modal)
        this.listeners = new ElemListener()
        this.callbacks = {}
        this.ranTokenCallbacks = []
        this.activeAddresses = {}
        this.boot()
    }

    boot()
    {
        this.listeners.set('selectCharge', 'click', (event) => {
            this.selectCharge(event.target)
        })

        for (let button of this.buttons) {
            let listener = this.listeners.get('selectCharge')

            button.addEventListener(listener.type, listener.callback)
        }

        this.pushCallback('balance_insufficient', (status, charge) => {
            this.modal.updateStatus('Please send the full amount...')
        })

        this.pushCallback('balance_sufficient', (status, charge) => {
            this.countdowns.flush()
        })
    }

    destroy()
    {
        for (let button of this.buttons) {
            let listener = this.listeners.shed('selectCharge')

            button.removeEventListener(listener.type, listener.callback)
        }

        this.buttons = []
        this.callbacks = {}
        this.ranTokenCallbacks = []
        this.activeAddresses = {}
        this.countdowns.flush()
        this.intervals.flush()
    }

    on(status, callback)
    {
        this.pushCallback(status, callback)

        return this
    }

    hasCallbacks(status)
    {
        return Array.isArray(this.callbacks[status])
    }

    pushCallback(status, callback)
    {
        if (! this.hasCallbacks(status)) {
            this.callbacks[status] = []
        }

        this.callbacks[status].push(callback)
    }

    hasRanTokenCallbacks(key)
    {
        return this.ranTokenCallbacks.includes(key)
    }

    pushRanTokenCallbacks(key)
    {
        this.ranTokenCallbacks.push(key)
    }

    runCallback(status, charge, repeatable)
    {
        let token = charge.button.dataset.token
        let key = status.status + ':' + token

        if (this.hasCallbacks(status.status)) {
            if (! this.hasRanTokenCallbacks(key) || repeatable) {
                this.callbacks[status.status].forEach((callback) => {
                    callback(status, charge)
                })
            }

            if (! this.hasRanTokenCallbacks(key) && ! repeatable) {
                this.pushRanTokenCallbacks(key)
            }
        }
    }

    stopListening(token)
    {
        this.intervals.forget(token)
    }

    setActiveAddress(currency, token, address)
    {
        let key = currency + ":" + token

        this.activeAddresses[key] = address
    }

    getActiveAddress(currency, token)
    {
        let key = currency + ":" + token

        return this.activeAddresses[key]
    }

    hasActiveAddress(currency, token)
    {
        let key = currency + ":" + token

        if (this.activeAddresses[key] === undefined) {
            return false
        }

        let expiresUnix = this.activeAddresses[key].expires_unix
        let nowUnix = Math.floor(new Date().getTime() / 1000)

        return nowUnix < expiresUnix
    }

    hasNotPaid(statuses)
    {
        statuses = statuses.map((status) => {
            return status.status
        })

        return ! statuses.includes('balance_sufficient')
    }

    selectCharge(button)
    {
        let token = button.dataset.token
        let path = Site.getChargePath(token)

        this.modal.show()
        this.countdowns.flush()
        this.requester.make(true, 'GET', path, {}, (response) => {
            let charge = {
                button: button,
                fiat: response.results.charge.fiat,
                amount: response.results.charge.amount,
                accept: Object.keys(response.results.charge.accept)
            }

            this.modal.showSelectCharge(charge, (currency, charge) => {
                this.makeChargeWith(currency, charge)
            })
        })
    }

    updateChargeStatus(charge, repeatable, hasNotPaidCallback)
    {
        let token = charge.button.dataset.token
        let path = Site.getChargePath(token)

        this.requester.make(false, 'GET', path, {}, (response) => {
            let statuses = response.results.statuses;

            if (! this.intervals.has(charge.button.dataset.token)) {
                this.intervals.set(charge.button.dataset.token, () => {
                    this.updateChargeStatus(charge, false)
                }, 10000)
            }

            if (statuses.length) {
                let status = statuses[0]

                this.runCallback(status, charge, repeatable)
            }

            if (this.hasNotPaid(statuses) && hasNotPaidCallback instanceof Function) {
                hasNotPaidCallback(statuses)
            }
        })
    }

    makeChargeWith(currency, charge)
    {
        let path = Site.getCreatePath(currency)
        let token = charge.button.dataset.token
        let params = {charge_token: token}

        this.updateChargeStatus(charge, true, (statuses) => {
            if (this.hasActiveAddress(currency, token)) {
                let address = this.getActiveAddress(currency, token)

                this.modal.clearContent()
                this.modal.showCharge(currency, charge, address, this)
            } else {
                this.requester.make(true, 'POST', path, params, (response) => {
                    let address = response.results.address

                    this.setActiveAddress(currency, token, address)
                    this.modal.showCharge(currency, charge, address, this)
                })
            }
        })
    }
}

return Charge
})()
