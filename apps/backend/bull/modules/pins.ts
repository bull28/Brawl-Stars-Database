import allSkins from "../data/brawlers_data.json";
import {themeMap, sceneMap, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, AVATAR_IMAGE_DIR, THEME_IMAGE_DIR, SCENE_IMAGE_DIR} from "../data/constants";
import {
    CollectionData, 
    CollectionBrawler, 
    CollectionPin, 
    DatabaseBrawlers, 
    AvatarList, 
    ThemeList, 
    SceneList, 
    DatabaseAvatars, 
    DatabaseThemes, 
    DatabaseScenes, 
    ThemeData, 
    ThemeScenePreview, 
    DatabaseCosmetics, 
    DatabaseAccessories
} from "../types";

/**
 * Reads a user's brawler and pin collection from the database and organizes it
 * in an array with useful properties for displaying the collection on-screen.
 * Also analyzes the collection and gives a score based on how close it is to
 * completion. All image files have their appropriate file paths added.
 * @param userCollection parsed brawlers object from the database
 * @returns collection summary object
 */
export function formatCollectionData(userCollection: DatabaseBrawlers, userAccessories: DatabaseAccessories): CollectionData{
    let collection: CollectionData = {
        unlockedBrawlers: 0,
        completedBrawlers: 0,
        totalBrawlers: 0,
        unlockedPins: 0,
        totalPins: 0,
        pinCopies: 0,
        unlockedAccessories: 0,
        totalAccessories: 0,
        collectionScore: "",
        scoreProgress: 0,
        avatarColor: "#000000",
        pinRarityColors: [],
        brawlers: [],
        accessories: []
    };

    const rarityColors = new Map<number, string>();

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "image", "rarity", "pins"];

    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];

        let unlockedPins = 0;
        let totalPins = 0;
        let pinCopies = 0;

        // Check that all desired properties exist all at once
        // so they do not have to be checked individually as
        // they are used
        let missingProperties = false;
        for (let j of includeFromBrawler){
            if (brawler.hasOwnProperty(j) === false){
                missingProperties = true;
            }
        }

        // This determines whether to check for unlocked pins
        // If a brawler is not unlocked, none of their pins can
        // be unlocked either.
        let hasBrawler = false;
        if (missingProperties === false){
            hasBrawler = userCollection.hasOwnProperty(brawler.name);
            if (hasBrawler === true){
                collection.unlockedBrawlers++;
            }
            collection.totalBrawlers++;
    
            let brawlerPins: CollectionPin[] = [];

            let pinData: DatabaseBrawlers[string] | undefined = undefined;
            if (hasBrawler === true){
                pinData = userCollection[brawler.name];
            }
    
            for (let y = 0; y < brawler.pins.length; y++){
                const pin = brawler.pins[y];

                let thisPin: CollectionPin = {
                    i: pin.image,
                    r: pin.rarity.value,
                    a: 0
                };

                if (rarityColors.has(pin.rarity.value) === false){
                    rarityColors.set(pin.rarity.value, pin.rarity.color);
                }

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (pinData !== void 0){
                    const pinCount = pinData[pin.name];
                    if (pinCount !== void 0){
                        if (pinCount > 0){
                            
                            unlockedPins++;
                            collection.unlockedPins++;
                        }
                        pinCopies += pinCount;
                        collection.pinCopies += pinCount;
                        thisPin.a = pinCount;
                    }
                }

                totalPins++;
                collection.totalPins++;

                brawlerPins.push(thisPin);
            }

            let thisBrawler: CollectionBrawler = {
                name: brawler.name,
                displayName: brawler.displayName,
                rarityColor: "#000000",
                i: PORTRAIT_IMAGE_DIR + brawler.image,
                u: hasBrawler,
                unlockedPins: unlockedPins,
                totalPins: totalPins,
                pinCopies: pinCopies,
                pinFilePath: PIN_IMAGE_DIR + brawler.name + "/",
                pins: brawlerPins
            };

            if (brawler.rarity.hasOwnProperty("color") === true){
                thisBrawler.rarityColor = brawler.rarity.color;
            }

            if (unlockedPins === totalPins){
                collection.completedBrawlers++;
            }

            collection.brawlers.push(thisBrawler);
        }
    }

    rarityColors.forEach((value) => {
        collection.pinRarityColors.push(value);
    });

    /*const accessories = getAllAccessories(userAccessories, accessoryLevel);
    for (let x = 0; x < accessories.length; x++){
        if (accessories[x].unlocked === true){
            collection.unlockedAccessories++;
        }
        collection.totalAccessories++;
    }
    collection.accessories = accessories;*/

    getCollectionScore(collection);

    return collection;
}

/**
 * Returns a complete list of all avatars a user is able to select.
 * All free avatars are included and the user's special avatars collected
 * are compared with the list of all special avatars to determine which
 * special avatars they can select. Their collection is also used to
 * determine which portrait avatars are available. This function returns
 * avatars with their file extension. The array userAvatars does not
 * contain file paths.
 * @param allAvatars object containing all free and special avatars
 * @param userCollection parsed brawlers object from the database
 * @param userAvatars parsed array of avatars from the database
 * @returns array of all avatar image names
 */
export function getAvatars(allAvatars: AvatarList, userCollection: DatabaseBrawlers, userAvatars: DatabaseAvatars): DatabaseAvatars{
    let avatars: DatabaseAvatars = [];
    let unlockedBrawlers: string[] = [];

    if (allAvatars.free === void 0 || allAvatars.special === void 0){
        return avatars;
    }

    // All free avatars are available, regardless of user
    for (let x = 0; x < allAvatars.free.length; x++){
        avatars.push(AVATAR_IMAGE_DIR + allAvatars.free[x]);
    }

    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];
        if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("image") === true){
            // If the user has the brawler unlocked, add the avatar as an option
            if (userCollection.hasOwnProperty(brawler.name) === true){
                unlockedBrawlers.push(brawler.image.split(".")[0]);
            }
        }
    }

    for (let x = 0; x < allAvatars.special.length; x++){
        const avatar = allAvatars.special[x];

        // If a special avatar is unlocked, add it to the array.

        // The entire path of avatars is no longer stored in the
        // database, only the file name
        const filePaths = avatar.split("/");
        const avatarName = filePaths[filePaths.length - 1].split(".")[0];
        if (avatarName !== void 0 && userAvatars.includes(avatarName) === true){
            avatars.push(AVATAR_IMAGE_DIR + avatar);
        }

        // If a special avatar is not unlocked, the only other way that
        // it can be used is if it is a brawler portrait and if the brawler
        // is unlocked, the portrait is made available.
        // In order for this to happen, the file names must be the same.
        else if (unlockedBrawlers.includes(avatarName) === true){
            avatars.push(AVATAR_IMAGE_DIR + avatar);
        }
    }

    return avatars;
}

/**
 * Returns a complete list of all themes a user is able to select.
 * All free themes are available to anyone. Special themes are only
 * obtainable from the shop. This function takes the name of a theme
 * bundle and classifies each image as either background, icon, or
 * any other type of item that may be contained in a bundle.
 * @param allThemes object containing all free and special themes
 * @param allScenes array containing all scenes
 * @param userThemes parsed array of themes from the database
 * @param userScenes parsed array of scenes from the database
 * @returns themes, gropued by type
 */
export function getThemes(allThemes: ThemeList, allScenes: SceneList, userThemes: DatabaseThemes, userScenes: DatabaseScenes): ThemeData{
    let themes: {[k: string]: Map<string, string>;} = {};
    let scenes: {[k: string]: ThemeScenePreview} = {};

    if (allThemes.free === void 0 && allThemes.special === void 0){
        return {
            background: [],
            icon: [],
            music: [],
            scene: []
        };
    }

    for (let t in allThemes){
        for (let theme of allThemes[t as keyof ThemeList]){
            let themeType = "";
            if (theme.includes("_icon") === true){
                themeType = "icon";
            } else if (theme.includes("_background") === true){
                themeType = "background";
            } else if (theme.includes("_selectpreview") === true){
                themeType = "selectpreview";
            } else if (theme.includes("_music") === true){
                themeType = "music";
            }
            // Add more types if they become available
    
            if (themeType !== ""){
                // Check if the theme map contains the current theme name and if it
                // does, add it to the themes, grouped by name
                const filePaths = theme.split("/");
                const themeName = filePaths[filePaths.length - 1].split("_" + themeType)[0];
                if (themeMap.has(themeName) === true){
                    if (themes.hasOwnProperty(themeName) === false){
                        themes[themeName] = new Map<string, string>();
                    }
    
                    if (t === "free"){
                        themes[themeName].set(themeType, THEME_IMAGE_DIR + theme);
                    } else if (t === "special"){
                        if (userThemes.includes(themeName) === true){
                            themes[themeName].set(themeType, THEME_IMAGE_DIR + theme);
                        }
                    }
                }
            }
        }
    }

    // Get the list of scenes the user can select

    // Load all the scene names from the map first
    sceneMap.forEach((value, key) => {
        if (userScenes.includes(key) === true || key === "default"){
            scenes[key] = {displayName: value, path: "", preview: "", background: ""};
        }
    });

    // Go through all the files in the scenes directory and set the
    // correct attribute of each scene object depending on whether
    // the file is a scene model, preview, or background
    for (let scene of allScenes){
        let sceneType = "";
        if (scene.includes("_scene") === true){
            sceneType = "path";
        } else if (scene.includes("_preview") === true){
            sceneType = "preview";
        } else if (scene.includes("_background") === true){
            sceneType = "background";
        }

        if (sceneType !== ""){
            const filePaths = scene.split("/");
            let sceneName = "";
            if (sceneType === "path"){
                // The model file names end in _scene instead of _path
                sceneName = filePaths[filePaths.length - 1].split("_scene")[0];
            } else{
                sceneName = filePaths[filePaths.length - 1].split("_" + sceneType)[0];
            }
            if (sceneName in scenes){
                // Model path is already contained in the scene map
                const sceneObject = scenes[sceneName];
                if (sceneObject.hasOwnProperty(sceneType) === true){
                    sceneObject[sceneType as keyof typeof sceneObject] = SCENE_IMAGE_DIR + scene;
                }
            }
        }
    }

    // The data is required to be grouped by file type instead of theme name
    let themesResult: ThemeData = {"background": [], "icon": [], "music": [], "scene": []};

    for (let key in themes){
        const value = themes[key];
        const themeName = themeMap.get(key);
        if (themeName !== void 0){

            const backgroundPath = value.get("background");
            const iconPath = value.get("icon");
            const iconPreview = value.get("selectpreview");
            const musicPath = value.get("music");

            if (backgroundPath !== void 0 &&
            iconPath !== void 0 &&
            iconPreview !== void 0 &&
            musicPath !== void 0){
                themesResult.background.push({
                    displayName: themeName,
                    path: backgroundPath
                });
                // Special case for icon and selectpreview: they need to be grouped together
                themesResult.icon.push({
                    displayName: themeName,
                    path: iconPath,
                    preview: iconPreview
                });
                themesResult.music.push({
                    displayName: themeName,
                    path: musicPath
                });
            }
        }
    }
    for (let key in scenes){
        // All scene objects have the same type so they can be added directly
        themesResult.scene.push(scenes[key]);
    }

    return themesResult;
}

/**
 * Searches the list of themes and scenes to match cosmetic names from
 * the database to the actual cosmetics. If cosmeticsData is not provided
 * or is empty, the default cosmetics will be returned.
 * @param allThemes object containing all free and special themes
 * @param allScenes array containing all scenes
 * @param cosmeticsData cosmetics result object from the database
 * @returns object containing file names of the cosmetics
 */
export function getCosmetics(allThemes: ThemeList, allScenes: SceneList, cosmeticsData: DatabaseCosmetics): DatabaseCosmetics{
    let setCosmetics: DatabaseCosmetics = {background: "", icon: "", music: "", scene: ""};

    // First, get the list of all default cosmetics
    const defaultThemes = allThemes.free.filter((value) => value.includes("default_"));

    // Initialize the object sent to the user with the default cosmetics
    for (let x of defaultThemes){
        if (x.includes("_background") === true){
            setCosmetics.background = THEME_IMAGE_DIR + x;
        } else if (x.includes("_icon") === true){
            setCosmetics.icon = THEME_IMAGE_DIR + x;
        } else if (x.includes("_music") === true){
            setCosmetics.music = THEME_IMAGE_DIR + x;
        }
    }

    // For all of the cosmetics returned from the database that are not empty string,
    // update the object with that cosmetic's name
    for (let x in cosmeticsData){
        let k = x as keyof DatabaseCosmetics;
        if (cosmeticsData[k] !== ""){
            if (x === "background" || x === "icon" || x === "music"){
                // Since the file extension might is not always the same, use the file name
                // from the allThemes/allScenes arrays

                // cosmeticsData[k] stores only whether the cosmetic is free/special
                // and its name. Both of those are contained in allThemes or allScenes.
                let result: string | undefined = undefined;
                if (cosmeticsData[k].includes("free/") === true){
                    result = allThemes.free.find((value) => value.includes(cosmeticsData[k]));
                } else{
                    result = allThemes.special.find((value) => value.includes(cosmeticsData[k]));
                }

                if (result !== void 0){
                    setCosmetics[x] = THEME_IMAGE_DIR + result;
                }
            } else if (x === "scene"){
                const result = allScenes.find((value) => value.includes(cosmeticsData[k]));
                if (result !== void 0){
                    setCosmetics[x] = SCENE_IMAGE_DIR + result;
                }
            }
        }
    }

    return setCosmetics;
}

/**
 * Sets the collectionScore and avatarColor fields of a collection object
 * based on how close it is to completion.
 * @param collection formatted collection object
 * @returns numeric value of collection score
 */
export function getCollectionScore(collection: CollectionData): number{
    if (collection.totalBrawlers === 0 || collection.totalPins === 0){
        return 0;
    }
    if (collection.pinCopies < collection.unlockedPins){
        return 0;
    }

    const brawlerScore = collection.unlockedBrawlers / collection.totalBrawlers;
    const completionScore = collection.completedBrawlers / collection.totalBrawlers;
    const pinScore = collection.unlockedPins / collection.totalPins;
    const duplicateScore = collection.pinCopies / (collection.pinCopies + collection.totalPins - collection.unlockedPins);
    //const accessoryScore = collection.unlockedAccessories / collection.totalAccessories;

    // Use larger numbers and floor to avoid non-exact representations of floating point numbers causing errors
    //const overallScore = Math.floor(400 * pinScore + 200 * brawlerScore + 50 * completionScore + 150 * duplicateScore + 400 * accessoryScore);
    const overallScore = Math.floor(600 * pinScore + 300 * brawlerScore + 100 * completionScore + 200 * duplicateScore);
    
    let grade = "X";
    let color = "#000000";
    let progress = 0;

    // bad code but it needs to be faster
    if      (overallScore < 1)      { grade = "X" ; color = "#ffffff"; progress = 0                          ; }
    else if (overallScore < 30)     { grade = "D" ; color = "#808080"; progress = (overallScore -    0) /  30; }
    else if (overallScore < 60)     { grade = "C-"; color = "#80c080"; progress = (overallScore -   30) /  30; }
    else if (overallScore < 90)     { grade = "C" ; color = "#80ff80"; progress = (overallScore -   60) /  30; }
    else if (overallScore < 120)    { grade = "C+"; color = "#00ff00"; progress = (overallScore -   90) /  30; }
    else if (overallScore < 180)    { grade = "B-"; color = "#00ffc0"; progress = (overallScore -  120) /  60; }
    else if (overallScore < 270)    { grade = "B" ; color = "#00ffff"; progress = (overallScore -  180) /  90; }
    else if (overallScore < 360)    { grade = "B+"; color = "#0080ff"; progress = (overallScore -  270) /  90; }
    else if (overallScore < 480)    { grade = "A-"; color = "#8000ff"; progress = (overallScore -  360) / 120; }
    else if (overallScore < 640)    { grade = "A" ; color = "#ff03cc"; progress = (overallScore -  480) / 160; }
    else if (overallScore < 800)    { grade = "A+"; color = "#fe0521"; progress = (overallScore -  640) / 160; }
    else if (overallScore < 1000)   { grade = "S-"; color = "#ff8000"; progress = (overallScore -  800) / 200; }
    else if (overallScore < 1200)   { grade = "S" ; color = "#fdf11e"; progress = (overallScore - 1000) / 200; }
    else                            { grade = "S+"; color = "rainbow"; progress = 1                          ; }

    collection.collectionScore = grade;
    collection.avatarColor = color;
    collection.scoreProgress = progress;

    return overallScore;
}
