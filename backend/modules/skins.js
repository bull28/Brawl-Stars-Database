/**
 * Searches for a specific brawler in an array of brawlers.
 * @param {Array} allSkins json object with all the brawlers
 * @param {String} name name of the brawler to search for
 * @returns json object of the brawler, empty if not found
 */
function getBrawler(allSkins, name){
    for (let x of allSkins){
        if (x.hasOwnProperty("name")){
            if (x.name === name){
                return x;
            }
        }
    }
    return {};
}

/**
 * Searches for a specific skin in a brawler's skin list.
 * @param {Array} brawler json object of a brawler
 * @param {String} skin name of the skin to search for
 * @returns json object of the skin, empty of not found
 */
function getSkin(brawler, skin){
    if (brawler.hasOwnProperty("skins")){
        for (let x of brawler.skins){
            if (x.hasOwnProperty("name")){
                if (x.name === skin){
                    return x;
                }
            }
        }
    }
    return {};
}

/**
 * Adds all the necessary file paths to any images in a
 * brawler's data. Also adds an array containing the names
 * and display names of the brawler's skins.
 * @param {Object} brawlerData the json object of the brawler
 * @param {Object} portraitFile file path to the portrait
 * @param {Object} modelFile file path to the 3d model
 * @param {Object} pinFile file path to the directory containing the pins
 * @returns json object of the brawler that can be sent to the user
 */
function formatBrawlerData(brawlerData, portraitFile, modelFile, pinFile){
    // since the skins array has to be modified, a copy of the brawlerData
    // must be created so that the original is not modified
    var brawlerInfo = {};

    for (var x in brawlerData){
        // the user can't do anything with the portrait file so don't send it
        if (x == "portrait"){
            portraitFile = portraitFile + brawlerData[x];
        } else if (x == "model"){
            // this model file is the one for the default skin
            modelFile = modelFile + brawlerData["name"] + "/" + brawlerData[x];
        }
        else if (x != "skins" && x != "pins"){
            brawlerInfo[x] = brawlerData[x];
        }
    }

    brawlerInfo["image"] = portraitFile;
    brawlerInfo["model"] = modelFile;


    // all information is copied from the original brawlerData to the new one
    // except for skins and pins which will be added in below
    brawlerInfo["skins"] = [];
    
    if (brawlerData.hasOwnProperty("skins")){
        // go through all the brawler's skins and add their name to the brawler's skin list
        let brawlerSkins = brawlerData.skins;
        for (var x = 0; x < brawlerSkins.length; x++){
            if (brawlerSkins[x].hasOwnProperty("name") && brawlerSkins[x].hasOwnProperty("displayName")){
                brawlerInfo["skins"].push({
                    "name": brawlerSkins[x].name,
                    "displayName": brawlerSkins[x].displayName
                });
            }
        }
    }

    // for the pins, since there is not as much data for them compared to skins,
    // all the data will be contained within a call to this endpoint so also
    // add the image paths here
    brawlerInfo["pins"] = [];

    if (brawlerData.hasOwnProperty("pins")){
        let brawlerPins = brawlerData.pins;
        for (var x = 0; x < brawlerPins.length; x++){
            var thisPin = {};
            for (let y in brawlerPins[x]){
                thisPin[y] = brawlerPins[x][y];
            }

            if (thisPin.hasOwnProperty("image")){
                thisPin.image = pinFile + brawlerData["name"] + "/" + thisPin.image;
            }
            brawlerInfo["pins"].push(thisPin);
        }
    }

    return brawlerInfo;
}

/**
 * Adds all the necessary file paths to any images in a skin's data. 
 * @param {*} brawlerName name of the brawler the skin belongs to
 * @param {*} skinData json object of the skin
 * @param {*} skinFile file path to the image
 * @param {*} skinModelFile file path to the 3d model
 * @param {*} groupFile file path to the skin group background image
 * @param {*} groupIconFile file path to the skin group icon
 * @returns json object of the skin which can be sent to the user
 */
function formatSkinData(skinData, brawlerName, skinFile, skinModelFile, groupFile, groupIconFile){
    var skinInfo = {};
    var groupData = {};

    for (var x in skinData){
        // do not copy the image or model, instead add it to the file path
        if (x == "image"){
            skinFile = skinFile + brawlerName + "/" + skinData.image;
        } else if (x == "model"){
            skinModelFile = skinModelFile + brawlerName + "/" + skinData.model;
        }

        // for the group, go into the group object and change its image to match the path
        else if (x == "group"){
            for (var y in skinData[x]){
                if (y == "image"){
                    groupData[y] = groupFile + skinData[x][y];
                } else if (y == "icon"){
                    groupData[y] = groupIconFile + skinData[x][y];
                } else{
                    groupData[y] = skinData[x][y];
                }
            }
            skinInfo[x] = groupData;
        }
        
        else{
            skinInfo[x] = skinData[x];
        }
    }

    skinInfo["image"] = skinFile;

    // exists gets set to true when it is validated
    skinInfo["model"] = {
        "exists": false,
        "image": skinModelFile
    };

    return skinInfo;
}

exports.getBrawler = getBrawler;
exports.getSkin = getSkin;
exports.formatBrawlerData = formatBrawlerData;
exports.formatSkinData = formatSkinData;
