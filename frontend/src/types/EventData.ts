export interface time {
    season: number,
    hour: number,
    minute: number,
    second: number,
    hoursPerSeason: number,
    maxSeasons: number
}
  
interface eventData {
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
  }
}

export interface event {
    current: eventData,
    upcoming: eventData,
    timeLeft: time
}