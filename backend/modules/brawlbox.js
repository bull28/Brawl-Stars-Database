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

function brawlBox(dropChances, boxType, allSkins, resources){
    // Validating parameters

    // dropChances has already been validated before being passed
    // to this function

    if (resources === undefined){
        // User is missing all resource information
        return [];
    }
    const resourceProperties = [
        "brawlers",
        "avatars",
        "wild_card_pins",
        "tokens",
        "token_doubler",
        "coins",
        "trade_credits"
    ];
    
    var missingProperties = false;
    for (let x of resourceProperties){
        if (!(resources.hasOwnProperty(x))){
            missingProperties = true;
        }
    }
    if (missingProperties){
        // User is missing some resource information
        return [];
    }

    if (boxType == "bonus" || dropChances.boxes.hasOwnProperty(boxType) == false){
        // Brawl Box type does not exist
        return [];
    }

    // All types of brawl boxes are guaranteed to give at least one drop, even coins
    // If a brawl box gives nothing then an error can be sent back

    // Deduct tokens to pay for the brawl box
    resources.tokens -= dropChances.boxes[boxType].cost;


    var rewards = [];
    var coinsReward = 0;
    
    const draws = dropChances.boxes[boxType].draws;
    const rewardTypeValues = dropChances.boxes[boxType].rewardTypeValues;

    var selections = [];
    for (let x of draws){
        var thisReward = rewardTypeValues[RNG(x)];
        if (thisReward !== undefined){
            selections.push(thisReward);
        }
    }
    //console.log(selections);

    //var selections = ["coins", "pin", "wildcard", "brawler", "bonus"];// for testing, use RNG later
    //selections = ["pin"];
    //selections = ["pinHighRarity", "pinHighRarity", "pinHighRarity", "pinHighRarity", "pinHighRarity", "pinHighRarity"];

    for (let x of selections){
        if (x != "nothing"){
        var drop = {
            "displayName": "",
            "rewardType": "empty",
            "amount": 1,
            "image": "",
            "backgroundColor": "#000000"
        };

        
        if (x == "coins"){
            drop = selectCoins(dropChances.rewardTypes.coins, resources);
        } else if (x == "pin" || x == "pinLowRarity" || x == "pinHighRarity"){
            drop = selectPin(dropChances.rewardTypes[x], resources, allSkins);
        } else if (x == "wildcard"){
            drop = selectWildCardPin(dropChances.rewardTypes.wildcard, resources, allSkins);
        } else if (x == "brawler" || x == "brawlerLowRarity"){
            drop = selectBrawler(dropChances.rewardTypes[x], resources, allSkins);
        } else if (x == "bonus"){
            drop = selectBonus(dropChances.boxes.bonus, dropChances.rewardTypes, resources);
        }

        if (drop.rewardType == "coins"){
            coinsReward += drop.amount;
        } else{
            rewards.push(drop);
        }
        }
    }

    // Add all coin rewards together at the same time
    if (coinsReward > 0){
        rewards.splice(0, 0, {
            "displayName": "Coins",
            "rewardType": "coins",
            "amount": coinsReward,
            "image": "resource_coins.webp",
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

function selectPin(pinDropChances, resources, allSkins){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    var userCollection = resources.brawlers;
    //var raritypmf = [36, 15, 6, 3, 0];
    var raritypmf = [0, 0, 0, 0, 0];
    //var raritypmf = pinDropChances.raritypmf;
    var pinsByRarity = [[], [], [], [], []];

    if (pinDropChances.raritypmf.length != raritypmf.length ||
        pinDropChances.minraritypmf.length != raritypmf.length){
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
                    const pinRarity = brawler.pins[pinIndex].rarity.value;
                    if (pinRarity < pinsByRarity.length && userCollection[brawler.name].includes(brawler.pins[pinIndex].name) == false){
                        // Add the brawler's index and the pin's index so when the random pin has to be
                        // chosen, the link to the pin object can be easily found without storing the
                        // entire pin data in an array.

                        //availablePins.push([brawlerIndex, pinIndex]);
                        pinsByRarity[pinRarity].push([brawlerIndex, pinIndex]);
                    }   
                }
            }
        }
    }
    
    // For the rarities with no more pins available, set their weights to 0
    // Later: make it slightly higher than 0 so a pin isn't always guaranteed
    for (let r = 0; r < raritypmf.length; r++){
        if (pinsByRarity[r].length == 0){
            raritypmf[r] = pinDropChances.minraritypmf[r];
            //raritypmf[r] = 1;
        } else{
            raritypmf[r] = pinDropChances.raritypmf[r];
        }
    }

    // Select a rarity based from the ones that do have pins available
    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availablePins = pinsByRarity[selectedRarity];
    }

    // If there are pins available to collect, randomly select one and add it.
    // Otherwise, give coins as an alternative reward.
    if (availablePins.length > 0){
        const selectedPin = availablePins[Math.floor(Math.random() * availablePins.length)];
        const pinObject = allSkins[selectedPin[0]].pins[selectedPin[1]];
        //userCollection[allSkins[selectedPin[0]].name].push(pinObject.name);
        userCollection[allSkins[selectedPin[0]].name] = userCollection[allSkins[selectedPin[0]].name].concat([pinObject.name]);

        result.displayName = "New Pin";
        result.rewardType = "pin";
        result.image = allSkins[selectedPin[0]].name + "/" + pinObject.image;// add the brawler's name directory
        result.backgroundColor = pinObject.rarity.color;
    } else{
        resources.coins += pinDropChances.coinConversion;

        result.rewardType = "coins";
        result.amount = pinDropChances.coinConversion;
        //result.backgroundColor = pinObject.rarity.color;
    }

    return result;
}

function selectWildCardPin(wildCardDropChances, resources, allSkins){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    //var raritypmf = [36, 15, 6, 3, 0];
    const raritypmf = wildCardDropChances.raritypmf;

    // If the wild card pins array is incorrectly formatted
    // fix it before adding a wild card pin
    if (resources.wild_card_pins.length < raritypmf.length){
        resources.wild_card_pins = [];
        for (let x = 0; x < raritypmf.length; x++){
            resources.wild_card_pins.push(0);
        }
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
        resources.wild_card_pins[selectedRarity]++;

        result.displayName = rarityName + " Wild Card Pin";
        result.rewardType = "wildcard";
        result.image = "wildcard_pin.webp";
        result.backgroundColor = rarityColor;
    }
    // Wild card pins can always be collected so there is no coins
    // alternative reward available here.

    return result;
}

function selectBrawler(brawlerDropChances, resources, allSkins){
    // Refer to selectPins for comments, most of the logic is the
    // same except brawlers are being added instead of pins
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    var userCollection = resources.brawlers;
    //var raritypmf = [32, 16, 8, 4, 2, 1, 1];
    var raritypmf = [0, 0, 0, 0, 0, 0, 0];
    var brawlersByRarity = [[], [], [], [], [], [], []];

    if (brawlerDropChances.raritypmf.length != raritypmf.length ||
        brawlerDropChances.minraritypmf.length != raritypmf.length){
        return result;
    }

    var availableBrawlers = [];
    
    for (var brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];

        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("rarity")){
            const brawlerRarity = brawler.rarity.value;
            if (brawlerRarity < brawlersByRarity.length && userCollection.hasOwnProperty(brawler.name) == false){
                //availableBrawlers.push(brawlerIndex);
                brawlersByRarity[brawlerRarity].push(brawlerIndex);
            }
        }
    }

    for (let r = 0; r < raritypmf.length; r++){
        if (brawlersByRarity[r].length == 0){
            raritypmf[r] = brawlerDropChances.minraritypmf[r];
        } else{
            raritypmf[r] = brawlerDropChances.raritypmf[r];
        }
    }

    var selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        availableBrawlers = brawlersByRarity[selectedRarity];
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
    } else{
        resources.coins += brawlerDropChances.coinConversion;

        result.rewardType = "coins";
        result.amount = brawlerDropChances.coinConversion;
        //result.backgroundColor = pinObject.rarity.color;
    }
    
    return result;
}

function selectBonus(allBonusDrops, rewardTypes, resources){
    var result = {
        "displayName": "",
        "rewardType": "empty",
        "amount": 1,
        "image": "",
        "backgroundColor": "#000000"
    };

    var userAvatars = resources.avatars;
    var bonuspmf = [0, 0, 0];

    const specialAvatars = rewardTypes["avatar"].pmfobject;// list of all avatars
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

    var selection = "";
    var selectedBonus = RNG(bonuspmf);

    if (selectedBonus >= 0){
        selection = allBonusDrops.rewardTypeValues[selectedBonus];
    }

    // Trade credits
    if (selection == "tradeCredits"){
        //const tradeCreditpmf = [347, 972, 480, 160, 40, 1];
        //const tradeCreditValues = [1, 2, 3, 5, 10, 69];

        const tradeCreditDrops = rewardTypes[allBonusDrops.rewardTypeValues[0]].pmfobject;
        var tradeCreditpmf = [];
        for (let x of tradeCreditDrops){
            tradeCreditpmf.push(x.weight);
        }

        var selectedIndex = RNG(tradeCreditpmf);
        if (selectedIndex >= 0){
            resources.trade_credits += tradeCreditDrops[selectedIndex].value;

            result.displayName = "Trade Credits";
            result.rewardType = "tradeCredits";
            result.image = "resource_trade_credits.webp";
            result.amount = tradeCreditDrops[selectedIndex].value;
            //result.backgroundColor = brawlerObject.rarity.color;
        }
    }
    // Token doubler
    else if (selection == "tokenDoubler"){
        const amounts = rewardTypes[allBonusDrops.rewardTypeValues[1]];
        var rewardAmount = 0;
        if (amounts.minAmount == amounts.maxAmount){
            rewardAmount = amounts.minAmount;
        } else{
            rewardAmount = Math.floor(amounts.minAmount + Math.random() * (amounts.maxAmount - amounts.minAmount + 1));
        }

        resources.token_doubler += rewardAmount;

        result.displayName = "Token Doubler";
        result.rewardType = "tokenDoubler";
        result.image = "resource_token_doubler.webp";
        result.amount = rewardAmount;
        //result.backgroundColor = brawlerObject.rarity.color;
    }
    // Avatar
    else if (selection == "avatar"){
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
