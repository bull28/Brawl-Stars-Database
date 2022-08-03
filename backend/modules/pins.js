function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    var collectionInfo = {
        "unlockedBrawlers":0,
        "totalBrawlers":0,
        "unlockedPins":0,
        "totalPins":0,
        "collection":[]
    };

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "portrait", "rarity", "pins"];
    
    // Iterate over all the brawlers
    for (let brawler of allSkins){
        var thisBrawler = {};
        var unlockedPins = 0;
        var totalPins = 0;

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
        var hasBrawler = false;
        if (missingProperties == false){
            hasBrawler = userCollection.hasOwnProperty(brawler.name);
            if (hasBrawler){
                collectionInfo.unlockedBrawlers++;
            }
            collectionInfo.totalBrawlers++;

            var brawlerPins = [];

            // Iterate over a brawler's pins
            for (let pin of brawler.pins){
                var thisPin = {};

                if (pin.hasOwnProperty("image")){
                    thisPin["i"] = pin["image"];
                }

                thisPin["u"] = false;

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (hasBrawler){    
                    if (userCollection[brawler.name].includes(pin.name)){
                        thisPin["u"] = true;
                        unlockedPins++;
                        collectionInfo.unlockedPins++;
                    }
                }
                totalPins++;
                collectionInfo.totalPins++;

                brawlerPins.push(thisPin);
            }

            thisBrawler["name"] = brawler.name;
            thisBrawler["displayName"] = brawler.displayName;

            thisBrawler["rarityColor"] = "#000000";
            if (brawler.rarity.hasOwnProperty("color")){
                thisBrawler["rarityColor"] = brawler.rarity.color;
            }
            
            thisBrawler["i"] = portraitFile + brawler.portrait;
            thisBrawler["u"] = hasBrawler;
            thisBrawler["unlockedPins"] = unlockedPins;
            thisBrawler["totalPins"] = totalPins;
            thisBrawler["pinFilePath"] = pinFile + brawler.name + "/";
            thisBrawler["pins"] = brawlerPins;

            collectionInfo.collection.push(thisBrawler);
        }
    }
    return collectionInfo;
}

function getAvatars(allSkins, allAvatars, userCollection, userAvatars){
    var avatarsInfo = [];
    var unlockedBrawlers = [];

    if (!(allSkins && allAvatars.free && allAvatars.special)){
        return avatarsInfo;
    }

    // All free avatars are available, regardless of user
    for (let avatar of allAvatars.free){
        avatarsInfo.push(avatar);
    }
    

    for (let brawler of allSkins){
        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("portrait")){
            // If the user has the brawler unlocked, add the avatar as an option
            if (userCollection.hasOwnProperty(brawler.name)){
                unlockedBrawlers.push(brawler.portrait);
            }
        }
    }
    
    for (let avatar of allAvatars.special){
        // If a special avatar is unlocked, add it to the array.
        if (userAvatars.includes(avatar)){
            avatarsInfo.push(avatar);
        }

        // If a special avatar is not unlocked, the only other way that
        // it can be used is if it is a brawler portrait and if the brawler
        // is unlocked, the portrait is made available.
        // In order for this to happen, the file names must be the same.
        else{
            const filePaths = avatar.split("/");
            const fileName = filePaths[filePaths.length - 1];
            if (unlockedBrawlers.includes(fileName)){
                avatarsInfo.push(avatar);
            }
        }
    }

    return avatarsInfo;
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
exports.getAvatars = getAvatars;
