function RNG(options){
    var totalWeight = 0;
    for (let x of options){
        totalWeight += x;
    }

    if (totalWeight == 0){
        return -1;
    }

    var weightRemaining = (Math.random() * totalWeight);

    var index = 0;
    var found = false;
    
    
    for (let x = 0; x < options.length; x++){
        if (found == false){
            weightRemaining -= options[x];
            if (weightRemaining < 0.0){
                index = x;
                found = true;
            }
        }
    }
    
    return index;
}

function validateDropChances(dropChances){
    // The object doesn't even exist...
    if (!(dropChances)){
        return false;
    }
    // If no key exists, immediately throw the game and shoot your teammates
    if (!(dropChances.hasOwnProperty("key"))){
        return false;
    }

    valid = true;
    for (let checkType in dropChances.key){
        // checkType = the reward type category (boxes or rewardTypes)
        if (dropChances.hasOwnProperty(checkType)){
            for (let x of dropChances.key[checkType]){
                // x = the object representing what to check ({"types": [...], "properties": [...]})
                if (x.hasOwnProperty("types") && x.hasOwnProperty("properties")){
                    for (let y of x.types){
                        // y = the key of the type to check ("coins", "tokenDoubler", ...)
                        // checkObject = the actual object to check (found using the key)
                        var checkObject = dropChances[checkType][y];
                        for (let key of x.properties){
                            // Go through the object's properties and check if they exist
                            if (!(checkObject.hasOwnProperty(key))){
                                valid = false;
                            }
                        }
                    }
                } else{
                    valid = false;
                }
            }
        } else{
            valid = false;
        }   
    }

    return valid;
}

function brawlBox(dropChances, allSkins, userCollection, userAvatars, wildCardPins, resources){
    // Validating parameters
    if (!(validateDropChances(dropChances))){
        return [];
    }

    if (userCollection === undefined || userAvatars === undefined || resources === undefined){
        return [];
    }
    const resourceProperties = ["tokens", "token_doubler", "coins", "trade_credits"];
    
    var missingProperties = false;
    for (let x of resourceProperties){
        if (!(resources.hasOwnProperty(x))){
            missingProperties = true;
        }
    }
    if (missingProperties){
        return [];
    }




    var rewards = [];
    var coinsReward = 0;

    /*const draws = [
        [0, 0, 20, 0, 6, 4],
        [1, 0, 1, 0, 0, 0],
        [3, 0, 0, 1, 0, 0]
    ];
    const rewardTypeValues = ["nothing", "coins", "pin", "wildcard", "brawler", "bonus"];*/
    
    const draws = dropChances.boxes.brawlBox.draws;
    const rewardTypeValues = dropChances.boxes.brawlBox.rewardTypeValues;

    var selections = [];
    for (let x of draws){
        var thisReward = rewardTypeValues[RNG(x)];
        if (thisReward !== undefined){
            selections.push(thisReward);
        }
    }
    console.log(selections);

    //var selections = ["coins", "pin", "wildcard", "brawler", "bonus"];// for testing, use RNG later
    //selections = ["pin"];

    for (let x of selections){
        var drop = {
            "displayName": "",
            "rewardType": "empty",
            "amount": 1,
            "image": "",
            "backgroundColor": "#000000"
        };

        if (x == "coins"){
            drop = selectCoins(dropChances.rewardTypes.coins, resources);
        } else if (x == "pin"){
            drop = selectPin(dropChances.rewardTypes.pin, allSkins, userCollection, resources);
        } else if (x == "wildcard"){
            drop = selectWildCardPin(dropChances.rewardTypes.wildcard, allSkins, wildCardPins);
        } else if (x == "brawler"){
            drop = selectBrawler(dropChances.rewardTypes.brawler, allSkins, userCollection, resources);
            /*userCollection = Object.keys(userCollection).sort().reduce(
                (obj, key) => { 
                  obj[key] = userCollection[key]; 
                  return obj;
                }, 
                {}
            );*/
        } else if (x == "bonus"){
            drop = selectBonus(dropChances.boxes.bonus, dropChances.rewardTypes, userAvatars, resources);
        }

        if (drop.rewardType == "coins"){
            coinsReward += drop.amount;
        } else{
            rewards.push(drop);
        }
    }

    // Add all coin rewards together at the same time
    if (coinsReward > 0){
        rewards.splice(0, 0, {
            "displayName": "Coins",
            "rewardType": "coins",
            "amount": coinsReward,
            "image": "misc/resource_coins.webp",
            "backgroundColor": "#000000"
        });
    }
    
    return rewards;
}

function selectCoins(staticDropChances, resources){
    const amounts = staticDropChances;
    var rewardAmount = 0;
    if (amounts.minAmount == amounts.maxAmount){
        rewardAmount = amounts.minAmount;
    } else{
        rewardAmount = Math.floor(amounts.minAmount + Math.random() * (amounts.maxAmount - amounts.minAmount + 1));
    }

    resources.coins += rewardAmount;

    var result = {
        "displayName": "",
        "rewardType": "coins",
        "amount": rewardAmount,
        "image": "",
        "backgroundColor": ""
    };

    return result;
}

function selectPin(rarityDropChances, allSkins, userCollection, resources){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    //var raritypmf = [36, 15, 6, 3, 0];
    var raritypmf = [0, 0, 0, 0, 0];
    //var raritypmf = rarityDropChances.raritypmf;
    var pinsByRarity = [[], [], [], [], []];

    if (rarityDropChances.raritypmf.length != raritypmf.length ||
        rarityDropChances.minraritypmf.length != raritypmf.length){
        return result;
    }
    
    var availablePins = [];
    
    for (var brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];

        //var missingProperties = (!(brawler.hasOwnProperty("name") && brawler.hasOwnProperty("pins")));
        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("pins")){
            //var hasBrawler = userCollection.hasOwnProperty(brawler.name);

            if (userCollection.hasOwnProperty(brawler.name)){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    if (brawler.pins[pinIndex].rarity.value < pinsByRarity.length && userCollection[brawler.name].includes(brawler.pins[pinIndex].name) == false){
                        // Add the brawler's index and the pin's index so when the random pin has to be
                        // chosen, the link to the pin object can be easily found without storing the
                        // entire pin data in an array.

                        //availablePins.push([brawlerIndex, pinIndex]);
                        pinsByRarity[brawler.pins[pinIndex].rarity.value].push([brawlerIndex, pinIndex]);
                    }   
                }
            }
        }
    }
    
    // For the rarities with no more pins available, set their weights to 0
    // Later: make it slightly higher than 0 so a pin isn't always guaranteed
    for (let r = 0; r < raritypmf.length; r++){
        if (pinsByRarity[r].length == 0){
            raritypmf[r] = rarityDropChances.minraritypmf[r];
        } else{
            raritypmf[r] = rarityDropChances.raritypmf[r];
        }
    }

    // Select a rarity based from the ones that do have pins available
    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availablePins = pinsByRarity[selectedRarity];
    } else{
        resources.coins += rarityDropChances.coinConversion;
        result.rewardType = "coins";
        result.amount = rarityDropChances.coinConversion;
        //result.backgroundColor = pinObject.rarity.color;
    }

    // If all pins have been collected, do not try to add a new one
    if (availablePins.length > 0){
        const selectedPin = availablePins[Math.floor(Math.random() * availablePins.length)];
        const pinObject = allSkins[selectedPin[0]].pins[selectedPin[1]];
        //userCollection[allSkins[selectedPin[0]].name].push(pinObject.name);
        userCollection[allSkins[selectedPin[0]].name] = userCollection[allSkins[selectedPin[0]].name].concat([pinObject.name]);

        result.displayName = "New Pin";
        result.rewardType = "pin";
        result.image = pinObject.image;
        result.backgroundColor = pinObject.rarity.color;
    }

    return result;
}

function selectWildCardPin(rarityDropChances, allSkins, wildCardPins){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    //var raritypmf = [36, 15, 6, 3, 0];
    const raritypmf = rarityDropChances.raritypmf;

    if (wildCardPins.length < raritypmf.length){
        return result;
    }

    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        var rarityName = "";
        var rarityColor = "#000000";

        // Look through the allSkins array to get the rarity
        // colors for the pin since there is no other place
        // where they are stored...
        var x = 0;
        var found = false;
        while (x < allSkins.length && found == false){
            if (allSkins[x].hasOwnProperty("pins")){
                for (let y of allSkins[x].pins){
                    if (y.rarity.value == selectedRarity){
                        rarityName = y.rarity.name;
                        rarityColor = y.rarity.color;
                        found = true;
                    }
                }
            }
            x++;
        }
        wildCardPins[selectedRarity]++;

        result.displayName = rarityName + " Wild Card Pin";
        result.rewardType = "wildcard";
        //result.image = "";//add wildcard image later when made
        result.backgroundColor = rarityColor;
    }

    return result;
}

function selectBrawler(rarityDropChances, allSkins, userCollection, resources){
    // Refer to selectPins for comments, most of the logic is the
    // same except brawlers are being added instead of pins
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };
    //var raritypmf = [32, 16, 8, 4, 2, 1, 1];
    var raritypmf = [0, 0, 0, 0, 0, 0, 0];
    var brawlersByRarity = [[], [], [], [], [], [], []];

    if (rarityDropChances.raritypmf.length != raritypmf.length ||
        rarityDropChances.minraritypmf.length != raritypmf.length){
        return result;
    }

    var availableBrawlers = [];
    
    for (var brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];

        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("rarity")){
            if (brawler.rarity.value < brawlersByRarity.length && userCollection.hasOwnProperty(brawler.name) == false){
                //availableBrawlers.push(brawlerIndex);
                brawlersByRarity[brawler.rarity.value].push(brawlerIndex);
            }
        }
    }

    for (let r = 0; r < raritypmf.length; r++){
        if (brawlersByRarity[r].length == 0){
            raritypmf[r] = rarityDropChances.minraritypmf[r];
        } else{
            raritypmf[r] = rarityDropChances.raritypmf[r];
        }
    }

    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availableBrawlers = brawlersByRarity[selectedRarity];
    } else{
        resources.coins += rarityDropChances.coinConversion;
        result.rewardType = "coins";
        result.amount = rarityDropChances.coinConversion;
        //result.backgroundColor = pinObject.rarity.color;
    }
    
    if (availableBrawlers.length > 0){
        const selectedIndex = availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)];
        const brawlerObject = allSkins[selectedIndex];
        if (!(userCollection.hasOwnProperty(brawlerObject.name))){
            userCollection[brawlerObject.name] = [];
        }

        result.displayName = brawlerObject.displayName;
        result.rewardType = "brawler";
        result.image = brawlerObject.portrait;
        result.backgroundColor = brawlerObject.rarity.color;
    }
    
    return result;
}

function selectBonus(allBonusDrops, bonusDropChances, userAvatars, resources){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };
    var bonuspmf = [0, 0, 0];

    const specialAvatars = bonusDropChances["avatar"].pmfobject;// list of all avatars
    if (specialAvatars === undefined){
        return result;
    }

    // Before choosing a bonus reward type, determine whether the user
    // has avatars to collect. Do this here so the array does not have
    // to be traversed more than once.
    var availableAvatars = [];
    for (let avatarIndex = 0; avatarIndex < specialAvatars.length; avatarIndex++){
        if (!(userAvatars.includes(specialAvatars[avatarIndex].value))){
            availableAvatars.push(specialAvatars[avatarIndex]);
        }
    }

    const bonusDraws = allBonusDrops.draws[0];
    if (bonusDraws.length != bonuspmf.length){
        return result;
    }

    for (let x = 0; x < bonusDraws.length; x++){
        if (allBonusDrops.rewardTypeValues[x] == "avatar"){
            if (availableAvatars.length == 0){
                // If there are no avatars available, remove the option to drop one
                bonuspmf[x] = 0;
            } else{
                bonuspmf[x] = bonusDraws[x];
            }
        } else{
            bonuspmf[x] = bonusDraws[x];
        }
    }


    var selectedBonus = RNG(bonuspmf);

    // Trade credits
    if (selectedBonus == 0){
        //const tradeCreditpmf = [347, 972, 480, 160, 40, 1];
        //const tradeCreditValues = [1, 2, 3, 5, 10, 69];

        const tradeCreditDrops = bonusDropChances[allBonusDrops.rewardTypeValues[0]].pmfobject;
        var tradeCreditpmf = [];
        for (let x of tradeCreditDrops){
            tradeCreditpmf.push(x.weight);
        }

        var selectedIndex = RNG(tradeCreditpmf);
        if (selectedIndex >= 0){
            resources.trade_credits += tradeCreditDrops[selectedIndex].value;

            result.displayName = "Trade Credits";
            result.rewardType = "tradeCredits";
            result.image = "misc/resource_trade_credits.webp";
            result.amount = tradeCreditDrops[selectedIndex].value;
            //result.backgroundColor = brawlerObject.rarity.color;
        }
    }
    // Token doubler
    else if (selectedBonus == 1){
        const amounts = bonusDropChances[allBonusDrops.rewardTypeValues[1]];
        var rewardAmount = 0;
        if (amounts.minAmount == amounts.maxAmount){
            rewardAmount = amounts.minAmount;
        } else{
            rewardAmount = Math.floor(amounts.minAmount + Math.random() * (amounts.maxAmount - amounts.minAmount + 1));
        }

        resources.token_doubler += rewardAmount;

        result.displayName = "Token Doubler";
        result.rewardType = "tokenDoubler";
        result.image = "misc/resource_token_doubler.webp";
        result.amount = rewardAmount;
        //result.backgroundColor = brawlerObject.rarity.color;
    }
    // Avatar
    else if (selectedBonus == 2){
        var avatarpmf = [];
        for (let x of availableAvatars){
            avatarpmf.push(x.weight);
        }
        
        var selectedIndex = RNG(avatarpmf);
        if (selectedIndex >= 0){
            userAvatars.push(availableAvatars[selectedIndex].value);
            
            result.displayName = "New Avatar";
            result.rewardType = "avatar";
            result.image = availableAvatars[selectedIndex].value;
        }
    }

    return result;
}

exports.brawlBox = brawlBox;
