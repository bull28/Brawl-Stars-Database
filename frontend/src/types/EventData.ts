export interface time {
    season: number,
    hour: number,
    minute: number,
    second: number,
    hoursPerSeason: number,
    maxSeasons: number
}
  
export interface event {
    gameMode: {
      name: string,
      displayName: string,
      data: {
        image: string,
        backgroundColor: string,
        textColor: string
      }
    },
    map: {
      name: string,
      displayName: string,
      bannerImage: string
    },
    timeLeft: time
}