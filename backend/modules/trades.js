function validatePins(allSkins, pinArray, pinFile, searchByName){
    //pinArray.slice()
    var validArray = [];
    var alreadyAdded = [];
    for (let x of pinArray){
        if (x.hasOwnProperty("brawler") && x.hasOwnProperty("pin") && x.hasOwnProperty("amount")){
            let brawlerObjects = allSkins.filter((element, index, array) => {return element.name == x.brawler;});
            if (brawlerObjects.length > 0 && brawlerObjects[0].hasOwnProperty("pins")){
                var pinObjects = [];
                if (searchByName){
                    pinObjects = brawlerObjects[0].pins.filter((element, index, array) => {return element.name == x.pin;});
                } else{
                    let imageArray = x.pin.split("/");
                    // remove the file path directories before checking the image
                    pinObjects = brawlerObjects[0].pins.filter((element, index, array) => {return element.image == imageArray[imageArray.length - 1];});
                }
                
                if (pinObjects.length > 0){
                    let thisPin = pinObjects[0];
                    if (thisPin.hasOwnProperty("rarity") && thisPin.hasOwnProperty("image") && x.amount > 0 && alreadyAdded.includes(thisPin.name) == false){
                        validArray.push({
                            "brawler": brawlerObjects[0].name,
                            "pin": thisPin.name,
                            "pinImage": pinFile + brawlerObjects[0].name + "/" + thisPin.image,
                            "amount": x.amount,
                            "rarityValue": thisPin.rarity.value,
                            "rarityColor": thisPin.rarity.color
                        });
                        alreadyAdded.push(thisPin.name);
                    }
                }
            }
        }
    }
    return validArray;
}


function getTradeCost(offerPins, requestPins){
    // add this later
    return 1;
}

exports.validatePins = validatePins;
exports.getTradeCost = getTradeCost;
