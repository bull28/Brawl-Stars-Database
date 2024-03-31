import express from "express";
import allSkins from "../data/brawlers_data.json";
import {HOURS_PER_REWARD, TOKENS_PER_REWARD, MAX_REWARD_STACK, AVATAR_IMAGE_DIR, THEME_IMAGE_DIR, SCENE_IMAGE_DIR} from "../data/constants";
import {signToken, validateToken, hashPassword, checkPassword} from "../modules/authenticate";
import {freeAvatarFiles, specialAvatarFiles, freeThemeFiles, specialThemeFiles, sceneFiles} from "../modules/fileloader";
import {getAvatars, getCosmetics, getThemes} from "../modules/pins";
import {MAP_CYCLE_HOURS, SeasonTime, mod, realToTime, subtractSeasonTimes} from "../modules/maps";
import {
    loginErrorHandler, 
    databaseErrorHandler, 
    getUnlockedCosmetics, 
    parseStringArray, 
    stringifyBrawlers, 
    userLogin, 
    createNewUser, 
    beforeUpdate, 
    getActiveCosmetics, 
    parseBrawlers, 
    getLastClaim, 
    updateAccount, 
    updateCosmetics, 
    updateLastClaim
} from "../modules/database";
import {Empty, TokenReqBody, AvatarList, DatabaseAvatars, DatabaseBrawlers, DatabaseCosmetics, DatabaseScenes, DatabaseThemes, SceneList, ThemeList} from "../types";

const router = express.Router();


const allAvatars: AvatarList = {free: freeAvatarFiles, special: specialAvatarFiles};
const allThemes: ThemeList = {free: freeThemeFiles, special: specialThemeFiles};
const allScenes: SceneList = sceneFiles;


interface LoginReqBody{
    username: string;
    password: string;
}

interface UpdateReqBody extends TokenReqBody{
    currentPassword: string;
    newPassword: string;
    newAvatar: string;
}

interface CosmeticReqBody extends TokenReqBody{
    setCosmetics: DatabaseCosmetics;
}

interface ClaimTokensReqBody extends TokenReqBody{
    claim: boolean;
}


// Accepts user credentials and returns a token if they are valid
router.post<Empty, Empty, LoginReqBody>("/login", databaseErrorHandler<LoginReqBody>(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (typeof username !== "string" || typeof password !== "string"){
        res.status(400).send("Username or password is missing.");
        return;
    }
    const results = await userLogin({username: username});

    if (results.length === 0){
        res.status(401).send("Incorrect username or password.");
        return;
    }
    if (typeof results[0].password !== "string"){
        res.status(500).send("Database is not set up properly.");
        return;
    }

    const match = await checkPassword(results[0].password, password);
    if (match === false){
        res.status(401).send("Incorrect username or password.");
        return;
    }

    const userInfo = signToken(results[0].username);
    res.json(userInfo);
}));

// Creates a new account then returns a token with the given credentials
router.post<Empty, Empty, LoginReqBody>("/signup", databaseErrorHandler<LoginReqBody>(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if ((typeof username === "string" && typeof password === "string") === false){
        res.status(400).send("Username or password is missing.");
        return;
    }

    if (username.length > 30 || password.length > 100){
        res.status(400).send("Username or password is too long. Maximum username length is 30 and password length is 100.");
        return;
    }
    if (username.length < 2 || password.length < 3){
        res.status(400).send("Username or password is too short. Minimum username length is 2 and password length is 3.");
        return;
    }

    // If there are enough brawlers in the game, give the user 3 to start so they do not keep getting coins instead of
    // pins because they have no brawlers unlocked.
    const startingBrawlers: DatabaseBrawlers = {};
    if (allSkins.length >= 10){
        for (let x = 0; x < 3; x++){
            if (Object.hasOwn(allSkins[x], "name") === true){
                // New pin unlocks are inserted as a new key with value 0
                startingBrawlers[allSkins[x].name] = {};
            }
        }
    }

    const hash = await hashPassword(password);

    await createNewUser({
        username: username,
        password: hash,
        active_avatar: "free/default",
        brawlers: stringifyBrawlers(startingBrawlers),
    });

    const userInfo = signToken(username);
    res.json(userInfo);
}));

// Updates an account's information
router.post<Empty, Empty, UpdateReqBody>("/update", loginErrorHandler<UpdateReqBody>(async (req, res, currentUsername) => {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;
    let newAvatar = req.body.newAvatar;

    if (typeof newPassword !== "string" || typeof newAvatar !== "string"){
        res.status(400).send("New password or new avatar is missing.");
        return;
    }
    if (newPassword !== "" && newPassword.length < 3){
        res.status(400).send("New password is too short. Minimum password length is 3.");
        return;
    }

    // If the user leaves any of the new fields as empty, this means they do not want them changed. Get the current
    // values of these fields first and replace any empty strings with them.

    const results = await beforeUpdate({username: currentUsername});

    const userBrawlers: DatabaseBrawlers = parseBrawlers(results[0].brawlers);
    const userAvatars: DatabaseAvatars = parseStringArray(results[0].avatars);

    // By default, the password will not be changed so set the new password hash to the same as what was already there.
    // If the user specifies a non-empty string as a new password, check their current password and if it is valid,
    // hash their new password then set their password to that.
    let newPasswordHash = results[0].password;

    if (newPassword !== ""){
        if (currentPassword === undefined){
            res.status(400).send("Current password is required to change password.");
            return;
        }

        const match = await checkPassword(results[0].password, currentPassword);
        if (match === false){
            res.status(401).send("Current password is incorrect.");
            return;
        }

        newPasswordHash = await hashPassword(newPassword);
    }

    // To avoid storing file extensions in the database, newAvatar must contain only the avatar name. If the user does
    // not change their avatar, the existing avatar already has no file extension. If the user changes their avatar, the
    // new avatar they provide will have a file extension so it must to be removed before assigning it to newAvatar.
    if (newAvatar === ""){
        // Do not check the avatar if they are not planning on changing it
        // It's fine to keep it, if for some reason they have an invalid avatar
        newAvatar = results[0].active_avatar;
    } else{
        // Check to make sure the user's new avatar is unlocked
        const avatars = getAvatars(allAvatars, userBrawlers, userAvatars);
        if (avatars.includes(newAvatar) === false){
            res.status(403).send("You are not allowed to use that avatar.");
            return;
        }

        const newAvatarName = newAvatar.split(".");
        if (newAvatarName.length !== 2){
            res.status(403).send("You are not allowed to use that avatar.");
            return;
        }
        // Do not store the avatar image directory in the database
        newAvatar = newAvatarName[0].replace(AVATAR_IMAGE_DIR, "");
    }

    await updateAccount({
        newPassword: newPasswordHash,
        newAvatar: newAvatar,
        username: currentUsername
    });

    const userInfo = signToken(currentUsername);
    res.json(userInfo);
}));

// Get the list of all avatars the user is allowed to select
router.post<Empty, Empty, TokenReqBody>("/avatar", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    // beforeUpdate contains at least as much information as necessary here.
    // This is used to avoid creating another database query function that is very similar to an existing one.
    const results = await beforeUpdate({username: username});
    const userBrawlers: DatabaseBrawlers = parseBrawlers(results[0].brawlers);
    const userAvatars: DatabaseAvatars = parseStringArray(results[0].avatars);

    const avatars = getAvatars(allAvatars, userBrawlers, userAvatars);
    res.json(avatars);
}));

// Get the list of all themes and scenes the user is allowed to select
router.post<Empty, Empty, TokenReqBody>("/theme", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await getUnlockedCosmetics({username: username});
    const userThemes: DatabaseThemes = parseStringArray(results[0].themes);
    const userScenes: DatabaseScenes = parseStringArray(results[0].scenes);

    const themes = getThemes(allThemes, allScenes, userThemes, userScenes);
    res.json(themes);
}));

// Get and set user cosmetic items
router.post<Empty, Empty, CosmeticReqBody>("/cosmetic", databaseErrorHandler<CosmeticReqBody>(async (req, res) => {
    // This object stores a validated copy of the user's request to change cosmetics
    const setCosmetics: DatabaseCosmetics = {
        background: "", icon: "", music: "", scene: ""
    };

    // A token is only required to set cosmetics
    // Getting cosmetics with no token will return the default when no user is logged in
    if (typeof req.body.token !== "string"){
        res.json(getCosmetics(allThemes, allScenes, setCosmetics));
        return;
    }
    const username = validateToken(req.body.token);
    if (username === ""){
        res.status(401).send("Invalid token.");
        return;
    }

    // If the user does not provide any cosmetics to set, get their currently active cosmetics then return
    if (req.body.setCosmetics === undefined){
        const results = await getActiveCosmetics({username: username});

        // results.length === 0 checked

        res.json(getCosmetics(allThemes, allScenes, results[0]));
        return;
    }

    // Try to read which cosmetics the user wants to set
    // If req.body.setCosmetics is not formatted correctly or is some other data type then an error will be sent here.
    for (const x in req.body.setCosmetics){
        if (x === "background" || x === "icon" || x === "music"){
            // Remove the file extension and the directory because that information is common among all themes and only
            // the necessary information has to be stored in the database.
            setCosmetics[x] = req.body.setCosmetics[x].split(".")[0].replace(THEME_IMAGE_DIR, "");
        } else if (x === "scene"){
            setCosmetics[x] = req.body.setCosmetics[x].split(".")[0].replace(SCENE_IMAGE_DIR, "");
        }
    }

    const results = await getUnlockedCosmetics({username: username});
    const userThemes: DatabaseThemes = parseStringArray(results[0].themes);
    const userScenes: DatabaseScenes = parseStringArray(results[0].scenes);

    // If the user wants to set their cosmetics, first validate their selections by checking the database values.
    let validCosmetics = true;
    for (const x in setCosmetics){
        // Empty string means set to default
        const k = x as keyof DatabaseCosmetics;
        if (setCosmetics[k] !== ""){
            if (x === "background" || x === "icon" || x === "music"){
                const filePaths = setCosmetics[x].split("/");
                const themeNameFull = filePaths[filePaths.length - 1];

                // Find the last underscore in themeNameFull and split it there. This has to be done to get the name of
                // the theme because it is stored without the _background, _icon, ...
                let splitIndex = themeNameFull.length;
                let foundSplitIndex = false;
                while (splitIndex >= 0 && foundSplitIndex === false){
                    if (themeNameFull[splitIndex] === "_"){
                        foundSplitIndex = true;
                    } else{
                        splitIndex--;
                    }
                }

                if (splitIndex > 0){
                    const themeName = themeNameFull.slice(0, splitIndex);

                    if (filePaths[0] === "free"){
                        // If the theme they want to set is free, make sure it exists in the free themes since the
                        // database does not store free themes, meaning there is no other way to tell if the theme they
                        // are trying to set actually exists.
                        if (allThemes.free.find((value) => value.includes(themeNameFull)) === undefined){
                            validCosmetics = false;
                        }
                    } else if (userThemes.includes(themeName) === false){
                        // If the theme they want to set is special, only need to check if that theme is stored in the
                        // database because only valid themes are inserted into the database when buying from the shop.
                        validCosmetics = false;
                    }
                } else{
                    validCosmetics = false;
                }
            } else if (x === "scene"){
                if (userScenes.includes(setCosmetics[x].split("_")[0]) === false){
                    validCosmetics = false;
                }
            }
        }
    }

    if (validCosmetics === false){
        res.status(403).send("You are not allowed to use one or more of those cosmetics.");
        return;
    }

    await updateCosmetics({
        background: setCosmetics.background,
        icon: setCosmetics.icon,
        music: setCosmetics.music,
        scene: setCosmetics.scene,
        username: username
    });

    // updateResults.affectedRows === 0 checked

    res.json(setCosmetics);
    return;
}));

// Claim any available tokens and/or get the time until tokens are available again
router.post<Empty, Empty, ClaimTokensReqBody>("/claimtokens", loginErrorHandler<ClaimTokensReqBody>(async (req, res, username) => {
    const results = await getLastClaim({username: username});

    // results.length === 0 checked

    const userResults = results[0];
    if (
        (Object.hasOwn(userResults, "username") && Object.hasOwn(userResults, "last_claim") &&
        Object.hasOwn(userResults, "tokens") && Object.hasOwn(userResults, "token_doubler")) === false
    ){
        res.status(500).send("Database is not set up properly.");
        return;
    }

    // Add tokens based on how much time has passed since they last logged in
    const currentTime = Date.now();
    const currentSeasonTime = realToTime(currentTime);

    // Batches of tokens to be given to the player
    let rewardsGiven = 0;

    // The season time does not manage times longer than 4 weeks so if the last login was over 4 weeks ago then give the
    // player the maximum login reward and reset. A time of 2 weeks is still beyond the amount of time required to
    // receive maximum rewards so give them the maximum reward for all times longer than 2 weeks, even though the map
    // rotation can handle times between 2 and 4 weeks.
    const hoursSinceLastLogin = (currentTime - userResults.last_claim) / 3600000;
    if (hoursSinceLastLogin >= MAP_CYCLE_HOURS){
        rewardsGiven = MAX_REWARD_STACK;
    } else{
        //currentSeasonTime = new maps.SeasonTime(1, 219, 0, 0);
        let currentSeason = currentSeasonTime.season;
        let currentHour = currentSeasonTime.hour;

        const lastLoginTime = realToTime(userResults.last_claim);
        //lastLoginTime = new maps.SeasonTime(0, 327, 0, 0);
        const lastLoginHour = lastLoginTime.hour;

        // Reward times must be compared on the same season so must handle cases where season values are not the same
        const seasonDiff = currentSeason - lastLoginTime.season;
        if (seasonDiff > 0){
            // Case 1: Positive carry over
            // Represents a case where the map rotation reset since the last login but not the ladder season reset
            // Remove the additional seasons and add a full season worth of hours for each season removed.
            //
            // Ex. Current time: [1, 5, 0, 0], Last login: [0, 309, 0, 0]
            // Remove 1 season and add 336 hours so the comparison becomes [0, 341, 0, 0] and [0, 309, 0, 0]
            currentSeason -= seasonDiff;
            currentHour += currentSeasonTime.hoursPerSeason * seasonDiff;
        } else if (seasonDiff < 0){
            // Case 2: Negative carry over
            // Represents a case where the ladder season reset since the last login
            // The comparison should be done using the higher season number so the lower has to be increased to match it
            //
            // Ex. (Note: the maxSeasons is 3 here because this is supposed to work no matter what maxSeasons is)
            // Current time: [0, 5, 0, 0], Last login: [1, 309, 0, 0], maxSeasons = 3
            // The desired comparison here is [1, 677, 0, 0] and [1, 309, 0, 0] since [0, 5, 0, 0] is actually an entire
            // season + a few hours ahead of [1, 309, 0, 0]
            //
            // Increase the lower season amount by subtracting seasonDiff
            // seasonDiff is negative here so subtracting it increases the value
            // In this example, [0, 5, 0, 0] becomes [1, 5, 0, 0]
            // Now the correct number of hours must be added to make the time equal again while keeping the season value
            // unchanged. To avoid negative numbers, add an entire season worth of hours then subtract the amount of
            // hours added when seasonDiff was subtracted from currentSeason.
            // In this example, [1, 5, 0, 0] +1008 => [1, 1013, 0, 0] -336 => [1, 677, 0, 0]
            // These two numbers of hours to be added/subtracted can both be obtained with (seasonDiff % maxSeasons)
            currentSeason -= seasonDiff;
            currentHour += currentSeasonTime.hoursPerSeason * mod(seasonDiff, currentSeasonTime.maxSeasons);
        } else if (currentHour < lastLoginHour){
            // Case 3: Entire season carry over
            // Represents a case where almost an entire season has passed since the last login
            // Add an entire season worth of hours to the current time to represent time passed since the last login.
            //
            // Ex. Current time: [0, 7, 0, 0], Last login: [0, 2, 0, 0], maxSeasons = 3
            // The current time should be treated as [3, 7, 0, 0] but since maxSeasons is 3, the time given by the
            // function is set to [0, 7, 0, 0] because it is equivalent in terms of the map rotation.
            currentHour += currentSeasonTime.hoursPerSeason * currentSeasonTime.maxSeasons;
        }

        // Rewards are given at multiples of HOURS_PER_REWARD hours in the season so find the last multiple before the
        // current time then compare it to the last login time.
        const lastRewardHour = Math.floor(currentHour / HOURS_PER_REWARD) * HOURS_PER_REWARD;

        // The user can claim rewards as long as their last login hour is less than the last reward hour. Since rewards
        // are given at the start of the hour, a last login hour the same as the last reward hour means the user logged
        // in right after the reward was given and cannot receive it. Their last login time should be treated as the
        // next hour. To account for this, add 1 to the lastLoginHour.
        // Ex. [0, 309, 28, 44] is treated the same as [0, 310, 0, 0]
        rewardsGiven = Math.floor((lastRewardHour - lastLoginHour - 1) / HOURS_PER_REWARD) + 1;// rounded up
    }

    if (rewardsGiven > MAX_REWARD_STACK){
        // A maximum of MAX_REWARD_STACK token batches can be stacked at once
        rewardsGiven = MAX_REWARD_STACK;
    }

    let tokenReward = rewardsGiven * TOKENS_PER_REWARD;
    let activeTokenDoubler = userResults.token_doubler;

    // If the user has a token doubler active
    if (activeTokenDoubler > 0){
        // If there are more tokens remaining in the doubler than the tokens being received right now then double all
        // current tokens received and subtract that amount from the doubler
        if (activeTokenDoubler > tokenReward){
            activeTokenDoubler -= tokenReward;
            tokenReward += tokenReward;
        }
        // If there are more tokens being received right now than there are remaining in the doubler then use up all
        // that is left in the doubler and add that many tokens to the current amount being received
        else{
            tokenReward += activeTokenDoubler;
            activeTokenDoubler = 0;
        }
    }
    const newTokenAmount = userResults.tokens + tokenReward;

    // To calculate the time until the next reward, only the current time is required.
    // No other modifications have to be done to the time.
    const nextRewardTime = subtractSeasonTimes(
        new SeasonTime(currentSeasonTime.season, Math.floor(currentSeasonTime.hour / HOURS_PER_REWARD + 1) * HOURS_PER_REWARD, 0, -1),
        currentSeasonTime
    );

    // If the user just wants to see how many tokens are available, send the response without updating the database.
    if (req.body.claim === false){
        res.json({
            tokensAvailable: tokenReward,
            tokensEarned: 0,
            timeLeft: nextRewardTime
        });
        return;
    }

    await updateLastClaim({
        last_claim: currentTime,
        tokens: newTokenAmount,
        token_doubler: activeTokenDoubler,
        username: userResults.username
    });

    // updateResults.affectedRows === 0 checked

    res.json({
        tokensAvailable: 0,
        tokensEarned: tokenReward,
        timeLeft: nextRewardTime
    });
}));

export default router;
