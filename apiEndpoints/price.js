'use strict';
let https = require('https');
let coinMarketCapApi = `api.coinmarketcap.com`;
 
exports.handler = function(event, context, callback) {
  let crypto = event.result.parameters['cryptocurrencies'];
  let fiat = event.result.parameters['currency-name'];
//   let crypto = 'bitcoin';
//   let fiat = 'USD';
  
  let options = searchCryptoRequestOptions(crypto, fiat);
  
  makeRequest(options, function( data, error) {
    // console.log(data);
    let price = data[0];
    var val = '';
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
        
        let response = price.name + " is worth " + val + " " + denom + ".";
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