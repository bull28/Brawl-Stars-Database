export type BrawlerData = {
    name: string,
    displayName: string,
    rarity: {value: number, name: string, color: string},
    skins: [{name: string, displayName: string}],
    image: string,
    description: string
}