'use strict';
let https = require('https');
let contentpull = require('contentpull');

// This is what responds to the user.
exports.handler = function (event, context, callback) {
    let intent = event.result.metadata['intentName'];
    let crypto = event.result.parameters['cryptocurrencies'];
    let vocab = event.result.parameters['vocabulary'];
    let fiat = (event.result.parameters['currency-name']) ? event.result.parameters['currency-name'] : `USD`;

    // Swaps the intent function called.
    // @todo Kinda hate that its if/else.  Re-thinking this.
    if (intent == `vocab`) {
        let word = (crypto) ? crypto : vocab;
        vocabIntent(word,function (res) {
            callback(null, { "speech": res, "type": 0 });
        });
    } else if (intent == `price`) {
        let options = {
            host: 'api.coinmarketcap.com',
            path: `/v1/ticker/${crypto}/?convert=${fiat}`
        };
        priceIntent(options, fiat, function (res) {
            callback(null, { "speech": res, "type": 0 });
        });
    } else {
        callback(null, { "speech": 'response', "type": 0 });
    }
};

// This handles the price intent.
function priceIntent(options, fiat, callback) {
    makeRequest(options, function (data, error) {
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

// This handles the vocab intent.
function vocabIntent(word,callback) {
    let response;
    
    // @todo create API from CMS (probably Drupal) to replace this...
    switch(word) {
        case `bitcoin`:
            response = `Bitcoin is a cryptocurrency and first decentralized digital currency. The bitcoin network is peer-to-peer and transactions take place between users directly. These transactions are verified by network nodes through the use of cryptography and recorded in a public distributed ledger called a blockchain.`
            break;
        case `cryptocurrency`:
            response = `Cryptocurrency is a digital asset designed to work as a medium of exchange that uses cryptography to secure its transactions, to control the creation of additional units, and to verify the transfer of assets.`
            break;
        case `decentralized`:
            response = `Decentralized computing is the allocation of resources, both hardware and software, to each individual workstation, or office location.`
            break;
        case `blockchain`:
            response = `A blockchain is a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block typically contains a cryptographic hash of the previous block, a timestamp and transaction data.`;
            break;
        case `coin`:
            response = `A coin is a digital asset used primarily as a medium of exchange on a blockchain. They are most often issued through mining blocks on the blockchain.`;
            break;
        case `token`:
            response = `A token is a digital asset used primarily as a representation of a security, utility, or commodity, on a blockchain.  They are most often issued via smart contracts on the Ethereum blockchain.`;
            break;
        case `mining`:
            response = `Mining is the process of adding transaction records to a cryptocurrency's public ledger or blockchain.  A network of decentralized computers are used to verify new transactions before they're added to the blockchain and that effort is called mining.`;
            break;

        default:
            response = `I'm sorry but I'm not able to explain ${word} yet.  Check back soon and I'll have more information.`;
    }
    
    callback(response);
}

// Calling external API's.
function makeRequest(options, callback) {
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