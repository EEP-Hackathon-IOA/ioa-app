const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

var kylleAddr = "0x4f2b31b73e65d2bd22a5dfcccb767177dfcdc403"
var steliosAddr = "0x03be9e52cf13a08f7709693caaa2eb8ea4549509"

var contract = {};

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {

  contract = session.get('contract')

  if (contract == null) {contract = {}}

  // Messaged Jon
  if (message.body.search('@jon') > -1) {

    sendMessage(session, "You messaged @jon from address " + session.address)

    // this.client.send()

  // Messaged Stelios
  } else if (message.body.search('@stelios') > -1) {

    if (message.body.search('#buy') > -1) {
      contract.buyerAddr = session.address
    } else if (message.body.search('#sell') > -1) {
      contract.sellerAddr = session.address
    }

    session.set('contract',contract)

    bot.client.send(steliosAddr, message.body)

  // Messaged Kylle
  } else if (message.body.search('@kylle') > -1) {

    if (message.body.search('#buy') > -1) {
      contract.buyerAddr = session.address
    } else if (message.body.search('#sell') > -1) {
      contract.sellerAddr = session.address
    }

    session.set('contract',contract)

    bot.client.send(kylleAddr, message.body)

  } else {

    sendMessage(session, "Received. Buyer = " + contract.buyerAddr + ". Seller = " + contract.sellerAddr)

  }
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'ping':
      pong(session)
      break
    case 'count':
      count(session)
      break
    case 'donate':
      donate(session)
      break
    case 'payment':
      donate(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hello Token!`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session, amount) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

// HELPERS

function sendMessage(session, message) {
  session.reply(SOFA.Message({
    body: message,
    showKeyboard: true,
  }))
}

function sendPayment(session, message) {
  let controls = [
    {type: 'button', label: 'Payment', value: 'payment'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
