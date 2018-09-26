const axios = require('axios');
const dateUtils = require("./dateUtils.js")

const BASE_URL = `https://search.bandsintown.com/search/`;
const X_API_KEY = `EJqbBuarkq7bNqBZgNnaA6hPG5b0HzAY1q6CBAF4`;
const APPLE_MUSIC_TOKEN = `eyJraWQiOiJDU0VBN0UySlBKIiwiYWxnIjoiRVMyNTYifQ.eyJleHAiOjE1NTE5NjU3NTAsImlzcyI6IlBBS0xWMlJXOUwiLCJpYXQiOjE1MzYxODg3NTB9.fFE2tucFNgjlrr4pgEXUrQd33S_J_HCRuJQlCAeKCawez-F4_56rYZ2fNnhaT6PPV4oGdtaK93Q6SGKD4Cwntw`;



const date = dateUtils.getStartAndEndTime();

const getTopSongsFromApple = async (artistName) => {

    const encodedArtistName = encodeURI(artistName);
 
    const appleResponse = await axios.request(
         {
             url: `https://api.music.apple.com/v1/catalog/us/search?term=${encodedArtistName}&types=songs`,
             method: `get`,
             headers: { "Authorization": `Bearer ${APPLE_MUSIC_TOKEN}`}
         }
     )
     .then((response) => {
        const artistSongs = response.data.results.songs.data
         
         // // taking first song in array - could be the most popular? most relevant?
        const urlOfSong = artistSongs[0].attributes.previews[0].url
        const titleOfSong = artistSongs[0].attributes.name
                 
        return {
            artistName,
            titleOfSong,
            urlOfSong
        }
         // console.log(artistName, titleOfSong, urlOfSong)
     })
     .catch(error => {
         console.log("error in appleresponse", artistName)
         return {}
         
     })
      return appleResponse
 }

const getTopArtistSongs = async (artistNames) => {
    const topSongs = [];
   
    const promises = 
        artistNames.map(async artistName => getTopSongsFromApple(artistName))
        
    await Promise.all(promises)
        .then(result => {
            /* check for empty response & call additional artist? */
            return topSongs.push(result)
        })
        .catch(error=> console.log(error))

    // // console.log("creating csv")
    // // downloadCSV(topSongs)
    // console.log("these are the top songs", topSongs)
    return topSongs
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
    })
    .catch(error => {
        console.log(error.message);
        return []
    });
}

// const getTopArtistNamesFromBIT = (coords) => {
//     return coords
// }


module.exports = { getTopArtistNamesFromBIT}