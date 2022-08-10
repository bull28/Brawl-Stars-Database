/**
 * Reads a user's brawler and pin collection from the database and organizes it
 * in an array with useful properties for displaying the collection on-screen.
 * Also analyzes the collection and gives a score based on how close it is to
 * completion. All image files have their appropriate file paths added.
 * @param {*} allSkins json array with all the brawlers
 * @param {*} userCollection parsed brawlers object from the database
 * @param {*} portraitFile file path to brawler portraits
 * @param {*} pinFile file path to the directory containing the pins
 * @returns json object of the collection that can be sent to the user
 */
function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    var collectionInfo = {
        "unlockedBrawlers":0,
        "completedBrawlers":0,
        "totalBrawlers":0,
        "unlockedPins":0,
        "totalPins":0,
        "collectionScore": "",
        "avatarColor": "#000000",
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
 * @param {*} userCollection parsed brawlers object from the database
 * @param {*} userAvatars parsed avatars object from the database
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

    return avatarsInfo;
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

    const brawlerScore = collection.unlockedBrawlers / collection.totalBrawlers;
    const completionScore = collection.completedBrawlers / collection.totalBrawlers;
    const pinScore = collection.unlockedPins / collection.totalPins;

    // use larger numbers and floor to avoid non-exact
    // representations of floating point numbers causing errors
    const overallScore = Math.floor(500 * pinScore + 300 * brawlerScore + 200 * completionScore);
    
    var grade = "X";
    var color = "#000000";

    // bad code but it needs to be faster
    if      (overallScore < 1)      { grade = "X" ; color = "#000000"; }
    else if (overallScore < 40)     { grade = "D" ; color = "#808080"; }
    else if (overallScore < 80)     { grade = "C-"; color = "#80C080"; }
    else if (overallScore < 120)    { grade = "C" ; color = "#80FF80"; }
    else if (overallScore < 200)    { grade = "C+"; color = "#00FF00"; }
    else if (overallScore < 300)    { grade = "B-"; color = "#00FFC0"; }
    else if (overallScore < 400)    { grade = "B" ; color = "#00FFFF"; }
    else if (overallScore < 560)    { grade = "B+"; color = "#0080FF"; }
    else if (overallScore < 720)    { grade = "A-"; color = "#8000FF"; }
    else if (overallScore < 840)    { grade = "A" ; color = "#FF03CC"; }
    else if (overallScore < 920)    { grade = "A+"; color = "#EA3331"; }
    else if (overallScore < 960)    { grade = "S-"; color = "#FF8000"; }
    else if (overallScore < 1000)   { grade = "S" ; color = "#FDF155"; }
    else                            { grade = "S+"; color = "rainbow"; }

    collection.collectionScore = grade;
    collection.avatarColor = color;
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
