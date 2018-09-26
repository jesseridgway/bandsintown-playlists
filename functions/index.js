const functions = require('firebase-functions');

const playlist = require("./playlist.js")

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
    
//     const bitResponse = playlist.getTopArtistNamesFromBIT();

//     response.send(bitResponse);
// });

exports.generatePlaylist = functions.https.onRequest((request, response) => {
    
    console.log("request params", request.query);

    // let bitResponse = playlist.getTopArtistNamesFromBIT({latitude:48.8666667, longitude:2.3333333});

    let bitResponse = playlist.getTopArtistNamesFromBIT({
       latitude: request.query.latitude,
       longitude: request.query.longitude 
    });

    console.log("bitResponse", bitResponse);

    response.status(200).send(`generated playlist for ${request.query.city_name}`);
});