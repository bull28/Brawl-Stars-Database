import express from "express";
import {createError} from "../modules/utils";
import {getNextTier, getMasteryLevel, findUserCharacter, getEnemyList, getCharacterPreview, getCharacterData} from "../modules/resources_module";
import {loginErrorHandler, getResources, setResources} from "../modules/database";
import {Empty, CharacterPreview, CharacterStatus} from "../types";

const router = express.Router();


interface UpgradeCharacterReqBody{
    character: string;
}

// Get the list of all game enemies
router.get("/enemies", (req, res) => {
    const enemies = getEnemyList();
    res.json({enemies: enemies});
});

// Get current coins, mastery points, and character tiers
router.get("/resources", loginErrorHandler(async (req, res, username) => {
    const resources = await getResources({username: username});

    const mastery = getMasteryLevel(resources.mastery);
    const characters: CharacterPreview[] = [];
    for (let x = 0; x < resources.characters.length; x++){
        const preview = getCharacterPreview(resources.characters[x]);
        if (preview !== undefined){
            characters.push(preview);
        }
    }

    res.json({
        username: username,
        coins: resources.coins,
        mastery: mastery,
        characters: characters
    });
}));

// Get detailed information about characters
router.get("/characters", loginErrorHandler(async (req, res, username) => {
    const resources = await getResources({username: username});

    const characters: CharacterStatus[] = [];
    for (let x = 0; x < resources.characters.length; x++){
        const data = getCharacterData(resources.characters[x]);
        if (data !== undefined){
            characters.push(data);
        }
    }

    res.json({characters: characters});
}));

// Upgrade a character
router.post<Empty, Empty, UpgradeCharacterReqBody>("/characters/upgrade", loginErrorHandler<UpgradeCharacterReqBody>(async (req, res, username) => {
    const characterName = req.body.character;
    if (typeof characterName !== "string"){
        res.status(400).json(createError("CharactersMissing"));
        return;
    }

    const resources = await getResources({username: username});

    const index = findUserCharacter(resources.characters, characterName);
    if (index < 0){
        res.status(404).json(createError("CharactersNotFound"));
        return;
    }

    const character = getCharacterData(resources.characters[index]);
    if (character === undefined){
        res.status(404).json(createError("CharactersNotFound"));
        return;
    }

    // Check coins cost
    if (resources.coins < character.upgrade.cost){
        res.status(403).json(createError("CharactersCannotAfford"));
        return;
    }

    // Check mastery level requirement
    const mastery = getMasteryLevel(resources.mastery);
    if (mastery.level < character.upgrade.masteryReq){
        res.status(403).json(createError("CharactersUpgradeDenied"));
        return;
    }

    // Check if it is already max level
    if (character.next.tier.level < 0){
        res.status(403).json(createError("CharactersMaxLevel"));
        return;
    }

    resources.coins -= character.upgrade.cost;
    resources.characters[index].tier = getNextTier(resources.characters[index].tier);

    // Get new data at new level
    const newCharacter = getCharacterData(resources.characters[index]);

    await setResources({resources: resources, username: username});

    res.json(newCharacter);
}));


export default router;
