const axios = require('axios');
require("./csv.js")
const {cities} = require("./cities.json")
const dateUtils = require("./dateUtils.js")

// console.log("playoist file");

//needs to be secure
const X_API_KEY = `EJqbBuarkq7bNqBZgNnaA6hPG5b0HzAY1q6CBAF4`;
const BASE_URL = `https://search.bandsintown.com/search/`;
const APPLE_MUSIC_TOKEN = `eyJraWQiOiJDU0VBN0UySlBKIiwiYWxnIjoiRVMyNTYifQ.eyJleHAiOjE1NTE5NjU3NTAsImlzcyI6IlBBS0xWMlJXOUwiLCJpYXQiOjE1MzYxODg3NTB9.fFE2tucFNgjlrr4pgEXUrQd33S_J_HCRuJQlCAeKCawez-F4_56rYZ2fNnhaT6PPV4oGdtaK93Q6SGKD4Cwntw`

const SAN_DIEGO_COORDS = {latitude: 32.71515, longitude: -117.15653}

// console.log("cityData", cityData)
//startDate & endDate variables to be calculated every time script run

const date = dateUtils.getStartAndEndTime()


const getTopArtistSongs = async (artistNames) => {
    const topSongs = [];
   
    const promises = artistNames.map(async artistName => getTopSongsFromApple(artistName))
    const results = await Promise.all(promises)
    .then(result => {
        
        /* check for empty response & call additional artist? */
        return topSongs.push(result)
    })
    .catch(error=> console.log(error))

    // console.log("creating csv")
    downloadCSV(topSongs)
}

const getTopSongsFromApple = async (artistName) => {

   const encodedArtistName = encodeURI(artistName)

   const appleResponse = await axios.request(
        {
            url: `https://api.music.apple.com/v1/catalog/us/search?term=${encodedArtistName}&types=songs`,
            method: `get`,
            headers: { "Authorization": `Bearer ${APPLE_MUSIC_TOKEN}`}
        }
    )
    .then(response => {
        const artistSongs = response.data.results.songs.data
        
        // // taking first song in array - could be the most popular? most relevant?
        const urlOfSong = artistSongs[0].attributes.previews[0].url
        const titleOfSong = artistSongs[0].attributes.name
        
        // // let songObject = JSON.parse(response.data.results)
        // // console.log("song object", songObject)

        // if (urlOfSong  === undefined || titleOfSong === undefined) {
        //     // console.log("no data")
        //     // console.log("artistName", artistName, "titleOfSong", titleOfSong, 'urlOfSong', urlOfSong)
        //     return 
        // } 
        // else {
        //     // console.log("artistName", artistName, "titleOfSong", titleOfSong, 'urlOfSong', urlOfSong)

            return {
                artistName,
                titleOfSong,
                urlOfSong
            }
        // }

        // console.log(artistName, titleOfSong, urlOfSong)
        
    })
    .catch(error => {
        console.log("error in appleresponse", artistName)
        return {}
        
    })

    return appleResponse
}

const getTopArtistNamesFromBIT = (cityCoords) => {
    axios.request(
        {
            url: `${BASE_URL}?query=
                {
                    "period": {
                        "starts_at": "${date.startsAt}",
                        "ends_at": "${date.endsAt}"
                    },
                    "location": "region",
                    "region": {
                        "latitude": ${cityCoords.latitude},
                        "longitude": ${cityCoords.longitude},
                        "radius": 50
                    },
                    "entities": [{
                        "type": "event",
                        "order": "rsvps",
                        "limit": 1
                        
                    }]
                }`,
            method: `get`,
            headers: {"x-api-key": X_API_KEY}
        }  
    )
    .then(response => {
        const artistStub = response.data._embedded.artists;
        const artistNames = artistStub.map( artistObj => artistObj.name);
        
       return getTopArtistSongs(artistNames)

        // console.log("bit api response", response.data)
    })
    .catch(error => {
        console.log(error.message);
    });

    // test array of artist names
    // getTopArtistSongs(["Maroon 5", "Shakira", "Lauryn Hill"])
}

// const generatePlaylists = () => {
//     cities.forEach(city => {
//         console.log("Generating Playlist for", city)
//         getTopArtistNamesFromBIT({latitude, longitude})
//     })
// }


/*  =============================      CSV       =================================== */

function convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    // console.log("args is ", args)

    data = args.data || null;
    // console.log("data is ", data)
    if (data === null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    
    // console.log("data 0", data[0][0])
    keys = Object.keys(data[0][0]);

    // console.log("keys are ", keys)

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data[0].forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}


const downloadCSV = function (args) {  
    var data, filename, link;

    //data is array of objects

    var csv = convertArrayOfObjectsToCSV({
        data: args
    });
    if (csv === null) {
        console.log("returning null csv")
        return;
    } 

    filename = args.filename || 'export.csv';


    // what is this doing
    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    console.log("data", data)
}



// getTopArtistNames(32.71515, -117.15653, "2018-09-04T07:00:00", "2018-09-11T07:00:00");
// getTopArtistNamesFromBIT(SAN_DIEGO_COORDS);



// getTopArtistNamesFromBIT(SAN_DIEGO_COORDS);
// {cityData[1].latitude, cityData[1].longitude}

// loop through list of coordinates of cities
// export each city data as csv


// getTopArtistNamesFromBIT()

// const getTopArtistNamesFromBIT = () => {
//     return "hello world from playlist!"
// }

module.exports = { getTopArtistNamesFromBIT}