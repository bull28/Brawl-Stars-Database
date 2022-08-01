function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    var collectionInfo = [];

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "portrait", "rarity", "pins"];

    // Iterate over all the brawlers
    for (let x of allSkins){
        var thisBrawler = {};

        // Check that all desired properties exist all at once
        // so they do not have to be checked individually as
        // they are used
        var missingProperties = false;
        for (let j of includeFromBrawler){
            if (!(x.hasOwnProperty(j))){
                missingProperties = true;
            }
        }

        // This determines whether to check for unlocked pins
        // If a brawler is not unlocked, none of their pins can
        // be unlocked either.
        let hasBrawler = false;
        if (missingProperties == false){
            hasBrawler = userCollection.hasOwnProperty(x.name);

            var brawlerPins = [];

            // Iterate over a brawler's pins
            for (let y of x.pins){
                var thisPin = {};

                // Iterate over the fields of a single pin object, do not include the rarity
                for (let i in y){
                    //if (i != "rarity" && i != "name"){//leaving the name out for now (change this later////)
                    //    thisPin[i] = y[i];
                    //}
                    if (i == "image"){
                        //thisPin[i] = "FRANK/" + y[i];
                        thisPin["image"] = y[i];
                    }
                }

                thisPin["unlocked"] = false;

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (hasBrawler){    
                    let hasPin = userCollection[x.name].includes(y.name);
                    if (hasPin == true){
                        thisPin["unlocked"] = true;
                    }
                }

                brawlerPins.push(thisPin);
            }

            thisBrawler["name"] = x.name;
            thisBrawler["displayName"] = x.displayName;
            thisBrawler["portrait"] = portraitFile + x.portrait;

            var rarityColor = "#000000";
            if (x.rarity.hasOwnProperty("color")){
                rarityColor = x.rarity.color;
            }

            thisBrawler["rarityColor"] = rarityColor;
            thisBrawler["unlocked"] = hasBrawler;
            thisBrawler["pinFilePath"] = pinFile + x.name + "/";
            thisBrawler["pins"] = brawlerPins;

            collectionInfo.push(thisBrawler);
        }
    }
    return collectionInfo;
}

exports.formatCollectionData = formatCollectionData;
