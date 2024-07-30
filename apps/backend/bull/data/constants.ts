export const IMAGE_FILE_EXTENSION = ".webp";
export const ASSETS_ROOT_DIR = "assets/images/";
export const PORTRAIT_IMAGE_DIR = "portraits/";
export const SKIN_IMAGE_DIR = "skins/";
export const SKIN_MODEL_DIR = "models/";
export const SKINGROUP_IMAGE_DIR = "skingroups/backgrounds/";
export const SKINGROUP_ICON_DIR = "skingroups/icons/";
export const SKIN_RARITY_ICON_DIR = "skingroups/rarities/";
export const MASTERY_IMAGE_DIR = "mastery/";
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
export const GAME_GEAR_IMAGE_DIR = "bullgame/images/resources/";
export const GAME_BRAWLER_IMAGE_DIR = "bullgame/images/characters/";

export const HOURS_PER_REWARD = 6;
export const TOKENS_PER_REWARD = 150;
export const MAX_REWARD_STACK = 4;

export const FEATURED_REFRESH_HOURS = 24;

export const TRADES_PER_PAGE = 20;

export const DEFAULT_REPORT_COST = 200;
export const CHALLENGE_REPORT_COST = 100;

export const BRAWL_BOX_RARE_DROP = 0.2;

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
    ["fairytale", "Once Upon a Brawl"],
    ["legendaryset", "Legendary"],
    ["stuntshow", "Stunt Show"],
    ["starrforce", "Starr Force"],
    ["deepsea", "Deep Sea"],
    ["darkmas", "Dark Brawlidays"],
    ["mandy", "Candyland"],
    ["love_swamp", "Swamp of Love"],
    ["melodie", "Melodie"],
    ["madevil", "Mad Evil Manor"],
    ["yellow_face", "\u00a0"]
]);

export const sceneMap = new Map<string, string>([
    ["default", "No Scene"],
    ["canyon", "Canyon"],
    ["mine", "Gem Mine"],
    ["retropolis", "Retropolis"],
    ["stunt_show", "Stunt Show"],
    ["giftshop", "Gift Shop"],
    ["arcade", "Arcade"]
]);

export const gameDifficulties = [
    "Difficulty 1",
    "Difficulty 2",
    "Difficulty 3",
    "Difficulty 4",
    "Difficulty 5",
    "Difficulty 6",
    "Difficulty 7",
    "Difficulty 8",
    "Difficulty 9",
    "Difficulty 10"
];

export const gameBrawlers = [
    {displayName: "Spike", image: "icon_spike"},
    {displayName: "Gus", image: "icon_gus"},
    {displayName: "Emz", image: "icon_emz"},
    {displayName: "Darryl", image: "icon_darryl"},
    {displayName: "Tara", image: "icon_tara"},
    {displayName: "Piper", image: "icon_piper"},
    {displayName: "Lily", image: "icon_lily"},
    {displayName: "Stu", image: "icon_stu"},
    {displayName: "Maisie", image: "icon_maisie"}
];

export const gameStarPowers = [
    {displayName: "Star Power 1", image: "star_power_1"},
    {displayName: "Star Power 2", image: "star_power_2"}
];

export const gameGears = [
    {displayName: "Speed", image: "gear_speed"},
    {displayName: "Health", image: "gear_health"},
    {displayName: "Shield", image: "gear_shield"},
    {displayName: "Damage", image: "gear_damage"},
    {displayName: "Energy", image: "gear_energy"},
    {displayName: "Ability", image: "gear_ability"},
    {displayName: "Score", image: "gear_score"}
];
