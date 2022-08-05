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

function brawlBox(allSkins, specialAvatars, userCollection, userAvatars, resources){
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

    //var selections = [draw1[RNG(draw1)].value, draw2[RNG(draw2)].value, draw3[RNG(draw3)].value];
    var selections = ["pin", "wildcard", "brawler", "bonus"];// for testing, use RNG later
    //selections = ["pin"];

    for (let x of selections){
        if (x == "nothing"){
            //do nothing
        } else if (x == "pin"){
            rewards.push(selectPin(allSkins, userCollection, resources));
            //const drop = selectPin(allSkins, userCollection);
            //console.log(userCollection, drop);
        } else if (x == "wildcard"){
            rewards.push(selectWildCardPin(allSkins));
            //const drop = selectWildCardPin(allSkins);
            //console.log(drop);
        } else if (x == "brawler"){
            rewards.push(selectBrawler(allSkins, userCollection, resources));
            //const drop = selectBrawler(allSkins, userCollection);
            /*userCollection = Object.keys(userCollection).sort().reduce(
                (obj, key) => { 
                  obj[key] = userCollection[key]; 
                  return obj;
                }, 
                {}
            );*/
        } else if (x == "bonus"){
            rewards.push(selectBonus(specialAvatars, userAvatars, resources));
            //const drop = selectBonus(specialAvatars, userAvatars, resources);
            //console.log(drop);
            //console.log(resources);
        }
    }
    //console.log(rewards);
    return rewards;
}

function selectPin(allSkins, userCollection, resources){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    var raritypmf = [36, 15, 6, 3, 0];
    var pinsByRarity = [[], [], [], [], []];
    
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
    for (let r = raritypmf.length - 1; r >= 0; r--){
        if (pinsByRarity[r].length == 0){
            raritypmf[r] = 0;
        }
    }

    // Select a rarity based from the ones that do have pins available
    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availablePins = pinsByRarity[selectedRarity];
    } else{
        resources.coins += 500;
        result.displayName = "Coins";
        result.rewardType = "coins";
        result.image = "misc/resource_coins.webp";
        result.amount = 500;
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

function selectWildCardPin(allSkins){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    var raritypmf = [36, 15, 6, 3, 0];
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
        result.displayName = rarityName + " Wild Card Pin";
        result.rewardType = "wildcard";
        //result.image = "";//add wildcard image later when made
        result.backgroundColor = rarityColor;
    }

    return result;
}

function selectBrawler(allSkins, userCollection, resources){
    // Refer to selectPins for comments, most of the logic is the
    // same except brawlers are being added instead of pins
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };
    var raritypmf = [32, 16, 8, 4, 2, 1, 1];
    var brawlersByRarity = [[], [], [], [], [], [], []];

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

    for (let r = raritypmf.length - 1; r >= 0; r--){
        if (brawlersByRarity[r].length == 0){
            raritypmf[r] = 0;
        }
    }
    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availableBrawlers = brawlersByRarity[selectedRarity];
    } else{
        resources.coins += 2500;
        result.displayName = "Coins";
        result.rewardType = "coins";
        result.image = "misc/resource_coins.webp";
        result.amount = 2500;
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

function selectBonus(specialAvatars, userAvatars, resources){
    specialAvatars = [
        {"value": "avatars/special/angry_darryl.webp", "weight": 4},
        {"value": "avatars/special/ELIXIR_GOLM.webp", "weight": 3},
        {"value": "avatars/special/viking_bull.webp", "weight": 2},
        {"value": "avatars/special/yellow_face_02.webp", "weight": 1}
    ];//remove this hard coded stuff later
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };
    var bonuspmf = [6, 5, 1];

    // Before choosing a bonus reward type, determine whether the user
    // has avatars to collect. Do this here so the array does not have
    // to be traversed more than once.
    var availableAvatars = [];
    for (let avatarIndex = 0; avatarIndex < specialAvatars.length; avatarIndex++){
        if (!(userAvatars.includes(specialAvatars[avatarIndex].value))){
            availableAvatars.push(specialAvatars[avatarIndex]);
        }
    }
    if (availableAvatars.length == 0){
        // If there are no avatars available, remove the option to drop one
        bonuspmf[2] = 0;
    }


    var selectedBonus = RNG(bonuspmf);

    // Trade credits
    if (selectedBonus == 0){
        const tradeCreditpmf = [347, 972, 480, 160, 40, 1];
        const tradeCreditValues = [1, 2, 3, 5, 10, 69];

        var selectedIndex = RNG(tradeCreditpmf);
        if (selectedIndex >= 0){
            resources.trade_credits += tradeCreditValues[selectedIndex];

            result.displayName = "Trade Credits";
            result.rewardType = "tradeCredits";
            result.image = "misc/resource_trade_credits.webp";
            result.amount = tradeCreditValues[selectedIndex];
            //result.backgroundColor = brawlerObject.rarity.color;
        }
    }
    // Token doubler
    else if (selectedBonus == 1){
        resources.token_doubler += 200;

        result.displayName = "Token Doubler";
        result.rewardType = "tokenDoubler";
        result.image = "misc/resource_token_doubler.webp";
        result.amount = 200;
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
