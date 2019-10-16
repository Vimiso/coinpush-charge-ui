## Description

The Coinpush Charge UI plugin enables a cryptocurrency payment modal in your web applications.

It is initialised with charge tokens generated via the [Coinpush.io API](https://coinpush.io/docs/api#approach-b), or any of its supported SDKs.

Read the [Coinpush.io Charge UI Docs](https://coinpush.io/docs/charge) to see a working demo.

## Contents

* [Browser Support](#browser-support)
* [Installation](#installation)
* [Usage](#usage)
    * [Initialisation](#initialisation)
    * [Testnet](#testnet)
    * [Events](#events)
    * [Modal API](#modal-api)
* [Links](#links)

## Browser Support

The plugin is supported in all modern browsers:

* Chrome >= 51
* Firefox >= 54
* Safari >= 10
* Opera >= 38
* Edge >= 12

## Installation

To run the CSS and Javascript locally, you must download and include `public/a/styles/charge-ui.css` and `public/a/scripts/charge-ui.js` in your markup. Or, simply include the assets via our servers:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Charge UI</title>

    <link rel="stylesheet" type="text/css" href="https://coinpush.io/a/styles/charge-ui.css">
</head>
<body>
    <script src="https://coinpush.io/a/scripts/charge-ui.js"></script>
</body>
</html>
```

## Usage

### Initialisation

Set up a payment button with a generated `charge_token`:

```html
<button class="coinpush cp-button" data-token="CHARGE_TOKEN_GENERATED_ON_THE_SERVER">
    Pay with Cryptocurrency
</button>
```

Create a new `CoinpushCharge` instance and inject the button elements by their class name:

```js
let buttons = document.getElementsByClassName('coinpush')
const coinpush = new CoinpushCharge(buttons)
```

You're now accepting payments! Use [Events](#events) to monitor charges.

### Testnet

Want to request the [Coinpush.io Testnet](https://coinpush.io/api/testnet)? Enable it like so:

```js
coinpush.requester.useTestnet()
```

### Events

To monitor a charge you must listen for payment statuses. Let's check them out:

| Status | Description |
| ------ | ----------- |
| balance_insufficient | Funds were received at the deposit address, but did not reach the expected amount. |
| balance_sufficient | Funds were received at the deposit address and reached the expected amount. |
| balance_sufficient_confirmed | Funds are sufficient and have at least one confirmation. |

Here's how to listen for payment statuses:

```js
coinpush.on('balance_sufficient', (status, charge) => {
    // Do whatever...
})
```

#### Handling Events

An example on how to handle events. Here, we wait for one confirmation before redirecting to a "thank-you" page:

```js
coinpush.on('balance_sufficient', (status, charge) => {
    coinpush.modal.showAwaitingConfirmation()
})

coinpush.on('balance_sufficient_confirmed', (status, charge) => {
    // Disable the charge button.
    charge.button.disabled = true

    // Show payment accepted screen with additional message.
    coinpush.modal.showPaymentAccepted('Redirecting...')

    // Stop listening for the charge's payment statuses.
    coinpush.stopListening(charge.button.dataset.token)

    // Redirect the user to verify the payment on the server.
    // TIP: Make sure you created the charge token.
    // TIP: Ensure the charge token cannot be used again.
    setInterval(() => {
        window.location.href = '/thank-you?token=' + token
    }, 3000)
})
```

### Modal API

You may manipulate the payment modal using the following methods:

* `coinpush.modal.show()` - `Boolean` - shows the modal.
* `coinpush.modal.hide()` - `Boolean` - hides the modal.
* `coinpush.modal.isOpen()` - `Boolean` - determines whether the modal is open.
* `coinpush.modal.clearContent()` - `Boolean` - clears all content in the modal.
* `coinpush.modal.appendContent([HTMLElement])` - `Boolean` - appends content in the modal.
* `coinpush.modal.statusIsVisible()` - `Boolean` - determines whether the status is visible.
* `coinpush.modal.updateStatus([string])` - `Boolean` - updates the status on the charge screen.
* `coinpush.modal.showAwaitingConfirmation([void|string])`  - `void` - shows the awaiting confirmation screen. Ability to add an optional message.
* `coinpush.modal.showPaymentAccepted([void|string])` - `void` - shows the success screen. Ability to add an optional message.

## Links

* [Coinpush.io Charge UI Docs](https://coinpush.io/docs/charge)
* [Coinpush.io API Docs](https://coinpush.io/docs/api)