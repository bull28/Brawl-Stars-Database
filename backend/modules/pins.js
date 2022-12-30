/**
 * Reads a user's brawler and pin collection from the database and organizes it
 * in an array with useful properties for displaying the collection on-screen.
 * Also analyzes the collection and gives a score based on how close it is to
 * completion. All image files have their appropriate file paths added.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Object} userCollection parsed brawlers object from the database
 * @param {String} portraitFile file path to brawler portraits
 * @param {String} pinFile file path to the directory containing the pins
 * @returns json object of the collection that can be sent to the user
 */
function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    var collectionInfo = {
        "unlockedBrawlers":0,
        "completedBrawlers":0,
        "totalBrawlers":0,
        "unlockedPins":0,
        "totalPins":0,
        "pinCopies": 0,
        "collectionScore": "",
        "scoreProgress": 0,
        "avatarColor": "#000000",
        "pinRarityColors": {},
        "collection":[]
    };

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "portrait", "rarity", "pins"];
    
    // Iterate over all the brawlers
    for (let brawler of allSkins){
        var thisBrawler = {};
        var unlockedPins = 0;
        var totalPins = 0;
        var pinCopies = 0;

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
                    thisPin["i"] = pin.image;
                }
                thisPin["a"] = 0;
                //console.log(pin);
                thisPin["r"] = pin.rarity.value;
                collectionInfo.pinRarityColors[pin.rarity.value] = pin.rarity.color;

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (hasBrawler){
                    var pinDataObject = userCollection[brawler.name];
                    /*
                    if (pinDataObject.hasOwnProperty(pin.name)){
                        //const pinAmount = userCollection[brawler.name][pin.name];
                        
                        if (pinDataObject[pin.name] > 0){
                            thisPin["u"] = true;
                            unlockedPins++;
                            collectionInfo.unlockedPins++;
                        }
                    }*/
                    
                    if (pinDataObject[pin.name] !== undefined){
                        if (pinDataObject[pin.name] > 0){
                            //thisPin["u"] = true;
                            unlockedPins++;
                            collectionInfo.unlockedPins++;
                        }
                        pinCopies += pinDataObject[pin.name];
                        collectionInfo.pinCopies += pinDataObject[pin.name];
                        thisPin["a"] = pinDataObject[pin.name];
                    }
                    
                    /*
                    if (userCollection[brawler.name].includes(pin.name)){
                        thisPin["u"] = true;
                        unlockedPins++;
                        collectionInfo.unlockedPins++;
                    }
                    */
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
            thisBrawler["pinCopies"] = pinCopies;
            thisBrawler["pinFilePath"] = pinFile + brawler.name + "/";
            thisBrawler["pins"] = brawlerPins;

            if (unlockedPins == totalPins){
                collectionInfo.completedBrawlers++;
            }

            collectionInfo.collection.push(thisBrawler);
        }
    }

    // After the collection is created, calculate its score
    getCollectionScore(collectionInfo);

    return collectionInfo;
}

/**
 * Returns a complete list of all avatars a user is able to select.
 * All free avatars are included and the user's special avatars collected
 * are compared with the list of all special avatars to determine which
 * special avatars they can select. Their collection is also used to
 * determine which portrait avatars are available.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Array} allAvatars json object with arrays of free and special avatars
 * @param {Object} userCollection parsed brawlers object from the database
 * @param {Array} userAvatars parsed avatars object from the database
 * @returns array of all avatar image names
 */
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

    // Lastly, check for achievement avatars
    const userCollectionStats = formatCollectionData(allSkins, userCollection, "", "");
    avatarsInfo = avatarsInfo.concat(getAchievementAvatars(allAvatars.special, userCollectionStats));

    return avatarsInfo;
}

function getShopItems(shopItems, allSkins, userCollection, userAvatars){
    var availableShopItems = {};

    const collectionInfo = formatCollectionData(allSkins, userCollection, "", "");
    for (let x in shopItems){
        // Depending on the type of item, check availability differently
        if (shopItems[x].itemType == "tradeCredits"){
            // Trade credits are always available
            availableShopItems[x] = shopItems[x];
        } else if (shopItems[x].itemType == "brawler"){
            // As long as the user has one or more brawlers left to unlock, allow them to buy a brawler
            if (collectionInfo.unlockedBrawlers < collectionInfo.totalBrawlers){
                availableShopItems[x] = shopItems[x];
            }
        } else if (shopItems[x].itemType == "avatar"){
            // If the user does not already own an avatar, it is available for them to buy
            if (userAvatars.includes(shopItems[x].extraData) == false){
                availableShopItems[x] = shopItems[x];
            }
        }
    }
    return availableShopItems;
}

/**
 * Checks whether a user is eligible to use achievement avatars which are only available
 * under specific conditions such as collecting a certain number of pins.
 * @param {Array} specialAvatars json array of all special avatars that exist
 * @param {*} collection formatted collection object
 * @returns array of file paths to achievement avatars
 */
function getAchievementAvatars(specialAvatars, collection){
    var achievementAvatars = [];
    
    const unlockedPins = collection.unlockedPins;


    if (unlockedPins >= 10){
        achievementAvatars.push("pins_collection_01");
    } if (unlockedPins >= 20){
        achievementAvatars.push("pins_collection_02");
    } if (unlockedPins >= 50){
        achievementAvatars.push("pins_collection_03");
    } if (unlockedPins >= 100){
        achievementAvatars.push("pins_collection_04");
    } if (unlockedPins >= 250){
        achievementAvatars.push("pins_collection_05");
    } if (unlockedPins >= 500){
        achievementAvatars.push("pins_collection_06");
    } if (unlockedPins >= 1000){
        achievementAvatars.push("pins_collection_07");
    }

    // Add more achievement avatars here like getting all pins for a specific brawler

    achievementAvatars = specialAvatars.filter((element, index, array) => {
        // Since file paths may change, instead of hardcoding the file paths
        // check to see if the avatar image name exists in the special avatars list
        // before returning it.
        const filePaths = element.split("/");
        return achievementAvatars.includes(filePaths[filePaths.length - 1].split(".")[0]);
    });

    return achievementAvatars;
}

/**
 * Sets the collectionScore and avatarColor fields of a collection object
 * based on how close it is to completion.
 * @param {Array} collection formatted collection object
 * @returns nothing
 */
function getCollectionScore(collection){
    if (collection.totalBrawlers == 0 || collection.totalPins == 0){
        return;
    }
    if (collection.pinCopies < collection.unlockedPins){
        return;
    }

    const brawlerScore = collection.unlockedBrawlers / collection.totalBrawlers;
    const completionScore = collection.completedBrawlers / collection.totalBrawlers;
    const pinScore = collection.unlockedPins / collection.totalPins;
    const duplicateScore = collection.pinCopies / (collection.pinCopies + collection.totalPins - collection.unlockedPins);

    // use larger numbers and floor to avoid non-exact
    // representations of floating point numbers causing errors
    const overallScore = Math.floor(500 * pinScore + 300 * brawlerScore + 200 * completionScore + 200 * duplicateScore);
    
    var grade = "X";
    var color = "#000000";
    var progress = 0;

    // bad code but it needs to be faster
    if      (overallScore < 1)      { grade = "X" ; color = "#000000"; progress = 0                          ; }
    else if (overallScore < 30)     { grade = "D" ; color = "#808080"; progress = (overallScore -    0) /  30; }
    else if (overallScore < 60)     { grade = "C-"; color = "#80C080"; progress = (overallScore -   30) /  30; }
    else if (overallScore < 90)     { grade = "C" ; color = "#80FF80"; progress = (overallScore -   60) /  30; }
    else if (overallScore < 120)    { grade = "C+"; color = "#00FF00"; progress = (overallScore -   90) /  30; }
    else if (overallScore < 180)    { grade = "B-"; color = "#00FFC0"; progress = (overallScore -  120) /  60; }
    else if (overallScore < 270)    { grade = "B" ; color = "#00FFFF"; progress = (overallScore -  180) /  90; }
    else if (overallScore < 360)    { grade = "B+"; color = "#0080FF"; progress = (overallScore -  270) /  90; }
    else if (overallScore < 480)    { grade = "A-"; color = "#8000FF"; progress = (overallScore -  360) / 120; }
    else if (overallScore < 640)    { grade = "A" ; color = "#FF03CC"; progress = (overallScore -  480) / 160; }
    else if (overallScore < 800)    { grade = "A+"; color = "#EA3331"; progress = (overallScore -  640) / 160; }
    else if (overallScore < 1000)   { grade = "S-"; color = "#FF8000"; progress = (overallScore -  800) / 200; }
    else if (overallScore < 1200)   { grade = "S" ; color = "#FDF155"; progress = (overallScore - 1000) / 200; }
    else                            { grade = "S+"; color = "rainbow"; progress = 1                          ; }

    collection.collectionScore = grade;
    collection.avatarColor = color;
    collection.scoreProgress = progress;
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
exports.getShopItems = getShopItems;
