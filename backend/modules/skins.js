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

exports.getBrawler = getBrawler;
exports.getSkin = getSkin;