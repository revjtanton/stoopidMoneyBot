'use strict';
const Alexa = require("alexa-sdk");
const https = require("https");
const coinMarketCapApi = `api.coinmarketcap.com`;

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const coins = [
  {name:"Bitcoin",abbrev:'btc'}
];

const handlers = {
  'LaunchRequest': function () {
    this.attributes.speechOutput = "Thank you for using the Stupid Money Skill.  You can ask me about the value of popular cryptocurrencies compared to common fiat currencies.  For example, you can ask How much is Bitcoin in Euros?  So how can I help you?";

    this.response.speak(this.attributes.speechOutput).listen(getGenericHelpMessage());
    this.emit(':responseReady');
  },
  'Vocab': function() {
    var test = this;
    const cryptoSlot = this.event.request.intent.slots.cryptocurrenciesslot;
    let responseWord;
    if (cryptoSlot && cryptoSlot.value) {
      responseWord = cryptoSlot.value.toLowerCase();

    }
    const vocabSlot = this.event.request.intent.slots.vocabularyslot;
    if (vocabSlot && vocabSlot.value) {
      responseWord = vocabSlot.value.toLowerCase();
    }
    this.response.speak(`I'm sorry I can't explain ${responseWord} yet.  I am learning all the time, check back later! For now I can tell you the value of crypto compared to dollars. How can I help you?`).listen(getGenericHelpMessage());
    this.emit(':responseReady');
  },
  'Price': function () {
    const cryptoSlot = this.event.request.intent.slots.cryptocurrenciesslot;
    let cryptoName;
    if (cryptoSlot && cryptoSlot.value) {
      cryptoName = cryptoSlot.value.toLowerCase();
    }
    let fiat = 'USD';
    var res = '';
    let options = searchCryptoRequestOptions(cryptoName, fiat);
    var test = this;
    
    makeRequest(options, function( data, error) {
      // console.log(data);
      let price = data[0];
      var val = 'Invalid';
      if (price) {
          switch(fiat) {
              case 'EUR':
                  val = price.price_eur;
                  break;
              case 'GBP':
                  val = price.price_gbp;
                  break;
              case 'CAD':
                  val = price.price_cad;
                  break;
              case "NZD":
                  val = price.price_nzd;
                  break;

              default:
                  val = price.price_usd;
          }

          var denom = ((fiat) ? fiat : 'USD');
          
          res = price.name + " is worth " + val + " USD.";
          test.response.speak(res);
          test.emit(':responseReady');
      }
      else {
          test.response.speak("There was an error in the Price intent");
          test.emit(':responseReady');
      }
    });
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak(getGenericHelpMessage()).listen(getGenericHelpMessage());
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak(`We're adding new functionality all the time.  Check back later to learn more!`);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    this.response.speak(`We're adding new functionality all the time.  Check back later to learn more!`);
    this.emit(':responseReady');
  }
};

// function getGenericHelpMessage(data){
function getGenericHelpMessage(){
  return "You can ask me about the value of popular cryptocurrencies compared to common fiat currencies.  For example, you can ask How much is Bitcoin in Euros?  So how can I help you?";
}

function searchCryptoRequestOptions(crypto, fiat = 'USD') {
  return {
      host: coinMarketCapApi,
      path: `/v1/ticker/`+crypto+'/?convert='+fiat
  };
}

function makeRequest(options, callback) {
  var request = https.request(options, 
  function(response) {
      var responseString = '';
      response.on('data', function(data) {
          responseString += data;
      });
       response.on('end', function() {
          var responseJSON = JSON.parse(responseString);
          callback(responseJSON, null);
      });
  });
  request.end();
}