export type BrawlerData = {
    name: string,
    displayName: string,
    rarity: {value: number, name: string, color: string},
    skins: [{name: string, displayName: string}],
    pins: [{image: string, rarity: {value: number, name: string, color: string}}],
    image: string,
    defaultSkin: string,
    description: string
}

export interface Brawler {
    name: string,
    displayName: string,
    rarity: {
        value: number,
        name: string,
        color: string
    },
    image: string
}