'use strict';
let https = require('https');
let coinMarketCapApi = `api.coinmarketcap.com`;
 
exports.handler = function(event, context, callback) {
  let crypto = '';
  let vocab = '';
  if(event.result.parameters['cryptocurrencies']) {
    switch (event.result.parameters['cryptocurrencies']) {
      case 'bitcoin':
      
    }
  }


  let crypto = event.result.parameters['cryptocurrencies'];
  let fiat = event.result.parameters['currency-name'];
//   let crypto = 'bitcoin';
//   let fiat = 'USD';
  
  let options = searchCryptoRequestOptions(crypto, fiat);


  
  makeRequest(options, function( data, error) {
    // console.log(data);
    let price = data[0];
    if (price) {
        let usd = price.price_usd;
        let response = price.name + " is worth " + usd + " in USD.";
        callback(null, {"speech": response,"type": 0});
    }
    else {
        callback(null, {"speech": "On the moon!","type": 0});
    }
  });
};
 
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