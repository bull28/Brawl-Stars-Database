export const IMAGE_FILE_EXTENSION = ".webp";
export const ASSETS_ROOT_DIR = "assets/images/";
export const PORTRAIT_IMAGE_DIR = "portraits/";
export const SKIN_IMAGE_DIR = "skins/";
export const SKIN_MODEL_DIR = "models/";
export const SKINGROUP_IMAGE_DIR = "skingroups/backgrounds/";
export const SKINGROUP_ICON_DIR = "skingroups/icons/";
export const PIN_IMAGE_DIR = "pins/";
export const GAMEMODE_IMAGE_DIR = "gamemodes/";
export const MAP_IMAGE_DIR = "maps/";
export const MAP_BANNER_DIR = "maps/banners/";
export const RESOURCE_IMAGE_DIR = "resources/";
export const AVATAR_IMAGE_DIR = "avatars/";
export const AVATAR_SPECIAL_DIR = "avatars/special/";
export const THEME_IMAGE_DIR = "themes/";
export const THEME_SPECIAL_DIR = "themes/special/";
export const SCENE_IMAGE_DIR = "scenes/";
export const ACCESSORY_IMAGE_DIR = "accessories/";

export const HOURS_PER_REWARD = 6;
export const TOKENS_PER_REWARD = 150;
export const MAX_REWARD_STACK = 4;

export const FEATURED_REFRESH_HOURS = 24;

export const TRADES_PER_PAGE = 20;

export const CHALLENGE_LOSS_MULTIPLIER = 5;
export const CHALLENGE_WIN_MULTIPLIER = 15;
export const CHALLENGE_COINS_PER_TOKEN = 3;

export const DAILY_CHALLENGE_REFRESH = 82800000;
export const DAILY_CHALLENGE_MULTIPLIER = 5;

export const REPLAY_CHALLENGE_START = 50;
export const RANDOM_CHALLENGE_START = 69;
export const PLAYER_CHALLENGE_START = 100;

export const themeMap = new Map<string, string>([
    ["default", "Default"],
    ["retro", "Retropolis"],
    ["mecha", "Mecha"],
    ["pirate", "Pirate Brawlidays"],
    ["lny_20", "Lunar Brawl"],
    ["psg", "Brawl Ball"],
    ["taras_bazaar", "Tara's Bazaar"],
    ["super_city", "Super City"],
    ["giftshop", "Starr Park"],
    ["lunar", "Moon Festival"],
    ["waterpark", "Waterpark"],
    ["legendaryset", "Legendary"],
    ["stuntshow", "Stunt Show"],
    ["deepsea", "Deep Sea"],
    ["yellow_face", " "]
]);

export const sceneMap = new Map<string, {displayName: string; preview: string;}>([
    ["canyon", {"displayName": "Canyon", "preview": "maps/banners/canyon"}],
    ["mine", {"displayName": "Gem Mine", "preview": "maps/banners/mine"}],
    ["retropolis", {"displayName": "Retropolis", "preview": "maps/banners/retropolis"}],
    ["stunt_show", {"displayName": "Stunt Show", "preview": "maps/banners/stuntshow"}]
]);
