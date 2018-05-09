'use strict';
let https = require('https');
let Contentpull = require('contentpull');

// This is what responds to the user.
exports.handler = function (event, context, callback) {
    let intent = event.result.metadata['intentName'];
    let crypto = event.result.parameters['cryptocurrencies'];
    let vocab = event.result.parameters['vocabulary'];
    let fiat = (event.result.parameters['currency-name']) ? event.result.parameters['currency-name'] : `USD`;

    // Swaps the intent function called.
    // @todo Kinda hate that its if/else.  Re-thinking this.
    if (intent == `crypto`) {
        let word = (crypto) ? crypto : vocab;
        let type = (crypto) ? 'cryptocurrency' : '';

        makeContentfulRequest(word, 'cryptocurrency', function(res) {
            callback(null, {"speech": res, "type": 0});
        });
    }
    
    if (intent == `price`) {
        let options = {
            host: 'api.coinmarketcap.com',
            path: `/v1/ticker/${crypto}/?convert=${fiat}`
        };
        priceIntent(options, fiat, function (res) {
            callback(null, { "speech": res, "type": 0 });
        });
    } 
};

// This handles the price intent and parsing coinmarketcap response
function priceIntent(options, fiat, callback) {
    makeApiRequest(options, function (data, error) {
        let price = data[0];
        let val;

        // If we've got a valid response from CoinMarketCap return it, otherwise say it's on the moon!
        if (price) {
            switch (fiat) {
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

            callback(`${price.name} is worth ${val} ${fiat}.`);
        }
        else {
            callback(`On the moon!`);
        }
    });
}

// This calls our Contentful API special
function makeContentfulRequest(word,type,callback) {
    let spaceid = 'uz41atzkf6i2';
    let accessToken = '1e66a807ce122915b4490080192085cab43b4cb3af536a9e2e8b0b71e9693ef2';
    let isPreview = false;
    let parsers = {
        Array: function (arr, parser) {
            delete arr.sys;
            arr.items.map(item => parser(item));
        }
    };
    let puller = new Contentpull(spaceid, accessToken, {
        preview: isPreview,
        parsers: parsers
    });
    let query = {
        name: word
    }

    puller.getEntryByType(type,query).parse().then((entry) => {
        callback(entry.fields.desc);
    }).catch(function () {
        callback(`I'm sorry but I can't explain ${word.charAt(0).toUpperCase() + word.slice(1)} yet.  Please check back later.`)
    });
}

// Calling external API's.
function makeApiRequest(options, callback) {
    var request = https.request(options,
        function (response) {
            var responseString = '';
            response.on('data', function (data) {
                responseString += data;
            });
            response.on('end', function () {
                var responseJSON = JSON.parse(responseString);
                callback(responseJSON, null);
            });
        });
    request.end();
}