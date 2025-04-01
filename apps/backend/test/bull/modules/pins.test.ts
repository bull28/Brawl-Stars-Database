import {expect} from "chai";
import allSkins from "../../../bull/data/brawlers_data.json";
import accessoryList from "../../../bull/data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, AVATAR_IMAGE_DIR, THEME_IMAGE_DIR, SCENE_IMAGE_DIR, themeMap, sceneMap} from "../../../bull/data/constants";
import {freeAvatarFiles, specialAvatarFiles, freeThemeFiles, specialThemeFiles, sceneFiles} from "../../../bull/modules/fileloader";
import {formatCollectionData, getAvatars, getThemes, getCosmetics, applyImageFiles, getCollectionScore} from "../../../bull/modules/pins";
import {AvatarList, ThemeList, SceneList} from "../../../bull/types";

const allAvatars: AvatarList = {free: freeAvatarFiles, special: specialAvatarFiles};
const allThemes: ThemeList = {free: freeThemeFiles, special: specialThemeFiles};
const allScenes: SceneList = sceneFiles;

describe("Collection module", function(){
    it("Create the correct collection score object for a user's collection", function(){
        // Used for a completed brawler
        const mandy = allSkins.find((value) => value.name === "mandy")!;
        expect(mandy).to.be.an("object");

        const testBrawlers = {
            "bull": {
                "bull_default": 1,
                "bull_angry": 20
            },
            "frank": {
                "frank_special": 5
            },
            "ash": {},
            "mandy": Object.fromEntries(mandy.pins.map((value) => [value.name, 1]))
        };
        const testAccessories = ["default1", "shop1", "brawlbox1"];
        const data = formatCollectionData(testBrawlers, testAccessories);

        expect(data).to.be.an("object");
        expect(data).to.have.keys([
            "unlockedBrawlers", "completedBrawlers", "totalBrawlers", "unlockedPins", "totalPins", "pinCopies",
            "unlockedAccessories", "totalAccessories", "collectionScore", "scoreProgress", "avatarColor",
            "pinRarityColors", "brawlers", "accessories"
        ]);
        expect(data.brawlers).to.be.an("array");
        expect(data.accessories).to.be.an("array");

        // Collection progress values
        expect(data.unlockedBrawlers).to.equal(4);
        expect(data.completedBrawlers).to.equal(1);
        expect(data.totalBrawlers).to.equal(allSkins.length);
        expect(data.unlockedPins).to.equal(mandy.pins.length + 3);
        expect(data.totalPins).to.equal(allSkins.reduce((previous, current) => previous + current.pins.length, 0));
        expect(data.pinCopies).to.equal(mandy.pins.length + 26);
        expect(data.unlockedAccessories).to.equal(testAccessories.length);
        expect(data.totalAccessories).to.equal(accessoryList.length);

        // Collection brawlers and pins
        expect(data.brawlers).to.have.lengthOf(allSkins.length);
        for (let x = 0; x < data.brawlers.length; x++){
            const brawler = data.brawlers[x];

            expect(brawler.name).to.equal(allSkins[x].name);
            expect(brawler.pins).to.be.an("array");
            expect(brawler.pins).to.have.lengthOf(allSkins[x].pins.length);

            if (brawler.name === "bull"){
                expect(brawler.u).to.be.true;
                expect(brawler.unlockedPins).to.equal(2);
                expect(brawler.pinCopies).to.equal(21);
            } else if (brawler.name === "frank"){
                expect(brawler.u).to.be.true;
                expect(brawler.unlockedPins).to.equal(1);
                expect(brawler.pinCopies).to.equal(5);
            } else if (brawler.name === "ash"){
                expect(brawler.u).to.be.true;
                expect(brawler.unlockedPins).to.equal(0);
                expect(brawler.pinCopies).to.equal(0);
            } else if (brawler.name === "mandy"){
                expect(brawler.u).to.be.true;
                expect(brawler.unlockedPins).to.equal(brawler.totalPins);
                expect(brawler.unlockedPins).to.equal(brawler.pinCopies);
                expect(brawler.unlockedPins).to.equal(mandy.pins.length);
            } else{
                expect(brawler.u).to.be.false;
                expect(brawler.unlockedPins).to.equal(0);
                expect(brawler.unlockedPins).to.equal(0);
            }
        }

        // Collection accessories
        expect(data.accessories).to.have.lengthOf(accessoryList.length);
        for (let x = 0; x < data.accessories.length; x++){
            expect(data.accessories[x].name).to.equal(accessoryList[x].name);

            if (testAccessories.includes(data.accessories[x].name) === true){
                expect(data.accessories[x].unlocked).to.be.true;
            } else{
                expect(data.accessories[x].unlocked).to.be.false;
            }
        }
    });

    it("Get the correct list of avatars a user can select", function(){
        const testBrawlers = {
            "bull": {},
            "frank": {}
        };
        const testAvatars = ["angry_darryl", "collection_01", "gamemode_heist", "not an avatar"];

        const data = getAvatars(allAvatars, testBrawlers, testAvatars);

        expect(data).to.be.an("array");

        // Check for free avatars
        for (let x = 0; x < allAvatars.free.length; x++){
            expect(data).to.include(AVATAR_IMAGE_DIR + allAvatars.free[x]);
        }
        // Check for special avatars
        expect(data).to.include(`${AVATAR_IMAGE_DIR}special/angry_darryl${IMAGE_FILE_EXTENSION}`);
        expect(data).to.include(`${AVATAR_IMAGE_DIR}special/collection_01${IMAGE_FILE_EXTENSION}`);
        expect(data).to.include(`${AVATAR_IMAGE_DIR}special/gamemode_heist${IMAGE_FILE_EXTENSION}`);
        // Check for brawler portrait avatars
        expect(data).to.include(`${AVATAR_IMAGE_DIR}special/portrait_bull${IMAGE_FILE_EXTENSION}`);
        expect(data).to.include(`${AVATAR_IMAGE_DIR}special/portrait_frank${IMAGE_FILE_EXTENSION}`);
    });

    it("Get the correct list of themes and scenes a user can select", function(){
        const testThemes = ["deepsea"];
        const testScenes = ["retropolis"];

        const data = getThemes(allThemes, allScenes, testThemes, testScenes);

        expect(data).to.be.an("object");
        expect(data).to.have.keys(["background", "icon", "music", "scene"]);

        // Themes
        const defaultThemeName = themeMap.get("default")!;
        const defaultThemePaths = {
            background: allThemes.free.find((value) => value.includes("default_background")),
            icon: allThemes.free.find((value) => value.includes("default_icon")),
            preview: allThemes.free.find((value) => value.includes("default_selectpreview")),
            music: allThemes.free.find((value) => value.includes("default_music"))
        };
        const testThemeName = themeMap.get("deepsea")!;
        const testThemePaths = {
            background: allThemes.special.find((value) => value.includes("deepsea_background")),
            icon: allThemes.special.find((value) => value.includes("deepsea_icon")),
            preview: allThemes.special.find((value) => value.includes("deepsea_selectpreview")),
            music: allThemes.special.find((value) => value.includes("deepsea_music"))
        };

        // Check for the default theme
        expect(data.background).to.be.an("array")
        .that.deep.includes({displayName: defaultThemeName, path: THEME_IMAGE_DIR + defaultThemePaths.background});
        expect(data.icon).to.be.an("array")
        .that.deep.includes({displayName: defaultThemeName, path: THEME_IMAGE_DIR + defaultThemePaths.icon, preview: THEME_IMAGE_DIR + defaultThemePaths.preview});
        expect(data.music).to.be.an("array")
        .that.deep.includes({displayName: defaultThemeName, path: THEME_IMAGE_DIR + defaultThemePaths.music});

        // Check for the special theme
        expect(data.background).to.deep.include({displayName: testThemeName, path: THEME_IMAGE_DIR + testThemePaths.background});
        expect(data.icon).to.deep.include({displayName: testThemeName, path: THEME_IMAGE_DIR + testThemePaths.icon, preview: THEME_IMAGE_DIR + testThemePaths.preview});
        expect(data.music).to.deep.include({displayName: testThemeName, path: THEME_IMAGE_DIR + testThemePaths.music});

        // Scenes
        const defaultScene = sceneMap.get("default")!;
        const defaultScenePreview = allScenes.find((value) => value.includes("default_preview"));
        const testScene = sceneMap.get("retropolis")!;
        const testScenePath = allScenes.find((value) => value.includes("retropolis_scene"));
        const testScenePreview = allScenes.find((value) => value.includes("retropolis_preview"));

        // Check for the default scene (no scene)
        expect(data.scene).to.be.an("array").that.deep.includes({
            displayName: defaultScene,
            path: "",
            preview: SCENE_IMAGE_DIR + defaultScenePreview,
            background: ""
        });

        // Check for the special scene
        expect(data.scene).to.deep.include({
            displayName: testScene,
            path: SCENE_IMAGE_DIR + testScenePath,
            preview: SCENE_IMAGE_DIR + testScenePreview,
            background: ""
        });
    });

    it("Get the files for a player's active cosmetics", function(){
        const defaultTheme = {
            background: THEME_IMAGE_DIR + allThemes.free.find((value) => value.includes("default_background")),
            icon: THEME_IMAGE_DIR + allThemes.free.find((value) => value.includes("default_icon")),
            music: THEME_IMAGE_DIR + allThemes.free.find((value) => value.includes("default_music")),
            scene: "",
            extra: ""
        };
        const specialTheme = {
            background: THEME_IMAGE_DIR + allThemes.special.find((value) => value.includes("darkmas_background")),
            icon: THEME_IMAGE_DIR + allThemes.special.find((value) => value.includes("stuntshow_icon")),
            music: THEME_IMAGE_DIR + allThemes.special.find((value) => value.includes("deepsea_music")),
            scene: SCENE_IMAGE_DIR + allScenes.find((value) => value.includes("retropolis_scene")),
            extra: THEME_IMAGE_DIR + allThemes.special.find((value) => value.includes("darkmas_extra"))
        };

        // Default cosmetics
        expect(getCosmetics(allThemes, allScenes, {background: "", icon: "", music: "", scene: "", extra: ""})).to.eql(defaultTheme);
        // Invalid cosmetics (should return default)
        expect(getCosmetics(allThemes, allScenes, {
            background: "not background",
            icon: "not icon",
            music: "not music",
            scene: "not scene",
            extra: "not extra"
        })).to.eql(defaultTheme);
        // Special cosmetics (should be able to find the extra file using the background)
        expect(getCosmetics(allThemes, allScenes, {
            background: "special/darkmas_background",
            icon: "special/stuntshow_icon",
            music: "special/deepsea_music",
            scene: "retropolis",
            extra: ""
        })).to.eql(specialTheme);
        // Mix of default and special cosmetics
        expect(getCosmetics(allThemes, allScenes, {
            background: "",
            icon: "special/stuntshow_icon",
            music: "free/default_music",
            scene: "",
            extra: ""
        })).to.eql({
            background: defaultTheme.background,
            icon: specialTheme.icon,
            music: defaultTheme.music,
            scene: defaultTheme.scene,
            extra: defaultTheme.extra
        });
    });

    it("Apply a file to the correct property of a cosmetics object", function(){
        const cosmetics = {background: "", icon: "", music: "", scene: "", extra: ""};

        applyImageFiles(cosmetics, "test_background");
        expect(cosmetics.background).to.equal(THEME_IMAGE_DIR + "test_background");

        applyImageFiles(cosmetics, "test_icon");
        expect(cosmetics.icon).to.equal(THEME_IMAGE_DIR + "test_icon");

        applyImageFiles(cosmetics, "test_music");
        expect(cosmetics.music).to.equal(THEME_IMAGE_DIR + "test_music");

        applyImageFiles(cosmetics, "test_extra");
        expect(cosmetics.extra).to.equal(THEME_IMAGE_DIR + "test_extra");

        expect(cosmetics).to.eql({
            background: THEME_IMAGE_DIR + "test_background",
            icon: THEME_IMAGE_DIR + "test_icon",
            music: THEME_IMAGE_DIR + "test_music",
            scene: "",
            extra: THEME_IMAGE_DIR + "test_extra"
        });
    });

    it("Calculate the score for a collection", function(){
        const testCollection = {
            unlockedBrawlers: 60,
            completedBrawlers: 10,
            totalBrawlers: 80,
            unlockedPins: 500,
            totalPins: 1000,
            pinCopies: 2000,
            unlockedAccessories: 40,
            totalAccessories: 80,
            collectionScore: "",
            scoreProgress: 0,
            avatarColor: "#000000",
            pinRarityColors: [],
            brawlers: [],
            accessories: []
        };
        const invalidCollection = {
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

        // Valid collection object
        expect(getCollectionScore(testCollection)).to.equal(676);
        expect(testCollection.collectionScore).to.equal("A+");
        expect(testCollection.scoreProgress).to.equal(0.225);
        // Invalid collection object (with 0 total brawlers, pins, and accessories)
        expect(getCollectionScore(invalidCollection)).to.equal(0);
    });
});
