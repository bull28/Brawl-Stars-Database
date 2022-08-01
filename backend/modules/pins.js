function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    var collectionInfo = [];

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "portrait", "rarity", "pins"];

    // Iterate over all the brawlers
    for (let brawler of allSkins){
        var thisBrawler = {};

        // Check that all desired properties exist all at once
        // so they do not have to be checked individually as
        // they are used
        var missingProperties = false;
        for (let j of includeFromBrawler){
            if (!(brawler.hasOwnProperty(j))){
                missingProperties = true;
            }
        }

        // This determines whether to check for unlocked pins
        // If a brawler is not unlocked, none of their pins can
        // be unlocked either.
        let hasBrawler = false;
        if (missingProperties == false){
            hasBrawler = userCollection.hasOwnProperty(brawler.name);

            var brawlerPins = [];

            // Iterate over a brawler's pins
            for (let pin of brawler.pins){
                var thisPin = {};

                // Iterate over the fields of a single pin object, do not include the rarity
                for (let x in pin){
                    if (x == "image"){
                        thisPin["image"] = pin[x];
                    }
                }

                thisPin["unlocked"] = false;

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (hasBrawler){    
                    let hasPin = userCollection[brawler.name].includes(pin.name);
                    if (hasPin == true){
                        thisPin["unlocked"] = true;
                    }
                }

                brawlerPins.push(thisPin);
            }

            thisBrawler["name"] = brawler.name;
            thisBrawler["displayName"] = brawler.displayName;
            thisBrawler["portrait"] = portraitFile + brawler.portrait;

            var rarityColor = "#000000";
            if (brawler.rarity.hasOwnProperty("color")){
                rarityColor = brawler.rarity.color;
            }

            thisBrawler["rarityColor"] = rarityColor;
            thisBrawler["unlocked"] = hasBrawler;
            thisBrawler["pinFilePath"] = pinFile + brawler.name + "/";
            thisBrawler["pins"] = brawlerPins;

            collectionInfo.push(thisBrawler);
        }
    }
    return collectionInfo;
}

// These functions may be used for brawl boxes and trading
function addBrawler(userCollection, brawler){
    if (userCollection.hasOwnProperty(brawler)){
        return;
    }
    // If the user does not already own the brawler,
    // initialize an empty pin list.
    userCollection[brawler] = [];
}

function addPin(userCollection, brawler, pin){
    if (!(userCollection.hasOwnProperty(brawler))){
        return;
    }
    if (userCollection[brawler].includes(pin)){
        return;
    }
    userCollection[brawler].push(pin);
}

function removePin(userCollection, brawler, pin){
    if (!(userCollection.hasOwnProperty(brawler))){
        return;
    }
    const pinIndex = userCollection[brawler].indexOf(pin);
    if (pinIndex >= 0){
        userCollection[brawler].splice(pinIndex, 1);
    }
}

exports.formatCollectionData = formatCollectionData;