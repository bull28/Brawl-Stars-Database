function renderMap(mapData){
    
    var container = document.getElementById("map");
    var text = document.createElement("h2");
    text.classList.add("colored_text");
    text.textContent = mapData.displayName;
    text.style.color = "#ff03cc";
    text.style.fontWeight = "normal";
    text.style.marginTop = "20px";
    text.style.marginBottom = "10px";
    container.append(text);

    var mapImage = document.createElement("div");
    mapImage.style.display = "flex";
    mapImage.style.flexDirection = "column";

    for (var x = 0; x < mapData.data.length; x++){
        var imageRow = document.createElement("div");
        imageRow.style.display = "flex";
        imageRow.style.flexDirection = "row";
        for (var y = 0; y < mapData.data[x].length; y++){
            const thisLetter = mapData.data[x][y];

            var imageTile = document.createElement("div");
            imageTile.style.display = "flex";
            imageTile.style.flexDirection = "column";
            imageTile.style.width = "20px";
            imageTile.style.height = "20px";

            if (x % 2 == y % 2){
                if (gameModeObjectives.hasOwnProperty(mapData.gameMode)){
                    imageTile.style.backgroundColor = gameModeObjectives[mapData.gameMode]["color1"];
                } else{
                    imageTile.style.backgroundColor = gameModeObjectives["default"]["color1"];
                }
                
            } else{
                if (gameModeObjectives.hasOwnProperty(mapData.gameMode)){
                    imageTile.style.backgroundColor = gameModeObjectives[mapData.gameMode]["color2"];
                } else{
                    imageTile.style.backgroundColor = gameModeObjectives["default"]["color2"];
                }
            }

            

            if (tileImages.hasOwnProperty(thisLetter)){
                var tileContent = document.createElement("img");

                let tileImageName = tileImages[thisLetter];
                tileContent.style.objectFit = "fill";
                tileContent.style.position = "absolute";

                var tileid = "default";
                if (tileImageAlignments.hasOwnProperty(thisLetter)){
                    tileid = thisLetter;
                }
                imageTile.style.justifyContent = tileImageAlignments[tileid]["justifyContent"];
                imageTile.style.alignItems = tileImageAlignments[tileid]["alignItems"];
                tileContent.style.width = tileImageAlignments[tileid]["width"];

                if (tileid == "8"){
                    if (gameModeObjectives.hasOwnProperty(mapData.gameMode)){//temporary solution
                        let objectiveData = gameModeObjectives[mapData.gameMode];
                        if (mapData.gameMode == "siege" && x < Math.floor(mapData.data.length/2)){
                            objectiveData = gameModeObjectives["siegered"];
                        }
                        tileImageName = objectiveData.image;
                        tileContent.style.width = objectiveData.width;
                    }
                }

                
                if (tileImageName != ""){
                    tileContent.src = "tiles/" + tileImageName + ".webp";
                }
            } else{
                // if the image is not available, replace the image with the tile's letter
                var tileContent = document.createElement("pre");
                tileContent.classList.add("colored_text");
                tileContent.textContent = thisLetter;
                tileContent.style.fontSize = "16px";
                tileContent.style.textAlign = "center";
                imageTile.style.justifyContent = "center";
            }

            imageTile.append(tileContent);
            imageRow.append(imageTile);
        }
        mapImage.append(imageRow);
    }
    container.append(mapImage);
}

let allData = [
    {
        "name": "open-zone",
        "displayName": "Open Zone",
        "gameMode": "hotzone",
        "data": [
            "CCB...........FFFFFFF",
            "C.......2.2.2..FFFFFF",
            "................FFFFF",
            "...y.....TXX....FFFFF",
            ".........WWW....FFFFF",
            ".......WWWWWWW..FFFFF",
            ".......WWWWWWW..FFFFF",
            ".......aaaaaaa..FFFFF",
            "FFF.............FFFFF",
            "FFF..............FFFF",
            "FFM...............FFF",
            "FFM.........MMM....FF",
            "MMM...........C.....F",
            "FFF.................F",
            "FF..................F",
            "F...................F",
            "F.........8.........F",
            "F...................F",
            "F..................FF",
            "F.................FFF",
            "F.....C...........MMM",
            "FF....MMM.........MFF",
            "FFF...............MFF",
            "FFFF..............FFF",
            "FFFFF.............FFF",
            "FFFFF..aaaaaaa.......",
            "FFFFF..WWWWWWW.......",
            "FFFFF..WWWWWWW.......",
            "FFFFF....WWW....y....",
            "FFFFF....XXT.........",
            "FFFFF................",
            "FFFFFF..1.1.1.......C",
            "FFFFFFF...........BCC"
        ]
    },
    {
        "name": "snake-prairie",
        "displayName": "Snake Prairie",
        "gameMode": "bounty",
        "data": [
            "FFFFFFF.2.2.2.FFFFFFF",
            "FFFFFFF.......FFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFMMMFFFF",
            "FFFFFYMMFFFFFFMMMFFFF",
            "FFFFFMMMFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFMMCFFFFFMMMM",
            "FFFFFFFFFMMMFFFFFMMMM",
            "FFFFYMFFFFFFFFFFFFFFF",
            "FFFFMMFFFFFFFFFFFFFFF",
            "FFFFMMF.......FFFFFFF",
            "FFFFFFF.D.....FFFFFFF",
            "FFFFFFF....D..FFFFFFF",
            "FFFFFFF.......MMMFFFF",
            "FFMMMFF......DYMMFFFF",
            "FFMMCFF..D....FFFFFFF",
            "FFFFFFF.......FFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFMMFF",
            "FFFFFFMMMFFFFMMFFMMFF",
            "FFFFFFMMMFFFFMMFFFFFF",
            "FFFFFFFFFFFFFMYFFFFFF",
            "MMMMFFFFFFFFFFFFFFFFF",
            "MMMMFFFFFFFFFFFFFFFFF",
            "FFFFFFFMMFFFFFMMFFFFF",
            "FFFFFFFMMFFFFFMMFFFFF",
            "FFFFFFFMCFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFFFFF",
            "FFFFFFF.......FFFFFFF",
            "FFFFFFF.1.1.1.FFFFFFF"
        ]
    },
    {
        "name": "shooting-star",
        "displayName": "Shooting Star",
        "gameMode": "bounty",
        "data": [
            "........2.2.2........",
            ".....................",
            ".................RR..",
            "XXX..............RR..",
            "YC.............CMMM..",
            ".....B...............",
            "....MMRR.............",
            "....MMRR.............",
            ".............D.......",
            "..................Y..",
            ".....D.........RRMMMM",
            "...RRWWWRR.....RRMMMM",
            "...RRWWWRR....D......",
            "...RRWWWRR...........",
            "......TNNN...........",
            "......D..............",
            ".............D.......",
            ".....................",
            ".....D.....NNNT......",
            "...........RRWWWRR...",
            "...........RRWWWRR...",
            "MMMMRR.....RRWWWRR...",
            "MMMMRR...............",
            "..Y..........D.......",
            ".....................",
            ".............RRMM....",
            "......D......RRMM....",
            "...............B.....",
            "..MMMC.............CY",
            "..RR..............XXX",
            "..RR.................",
            ".....................",
            "........1.1.1........"
        ]
    },
    {
        "name": "deep-end",
        "displayName": "Deep End",
        "gameMode": "knockout",
        "data": [
            "WWWWW...2.2.2...WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            ".....................",
            "................FF...",
            "................FF...",
            "...MM....MMM....MM...",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            ".......vvvvvvv.......",
            ".......vFFFFFv.......",
            "WWWWW..vFFFFFv..WWWWW",
            "WWWWWvvvFFFFFvvvWWWWW",
            "WWWWW..vFFFFFv..WWWWW",
            ".......vFFFFFv.......",
            ".......vvvvvvv.......",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            "...MM....MMM....MM...",
            "...FF................",
            "...FF................",
            ".....................",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...........WWWWW",
            "WWWWW...1.1.1...WWWWW"
        ]
    },
    {
        "name": "minecart-madness",
        "displayName": "Minecart Madness",
        "gameMode": "gemgrab",
        "data": [
            "YYC.....2.2.2.....CYY",
            "YC.................CY",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            "...RRMMMMRRRMMMRRMMMM",
            "...RRMMMMRRRMMMRRMMMM",
            ".....................",
            ".....................",
            ".....................",
            "aaaaaaRR....RRMMRR...",
            "......RR....RRMMRR...",
            ".....................",
            "Q...................Q",
            ".....................",
            "...RRMMRR....RR......",
            "...RRMMRR....RRaaaaaa",
            ".....................",
            ".....................",
            ".....................",
            "MMMMRRMMMRRRMMMMRR...",
            "MMMMRRMMMRRRMMMMRR...",
            ".....................",
            ".....................",
            ".....................",
            ".....................",
            "......D.D.D.D.D......",
            ".....................",
            "YC.................CY",
            "YYC.....1.1.1.....CYY"
        ]
    },
    {
        "name": "extra-bouncy",
        "displayName": "Extra Bouncy",
        "gameMode": "brawlball",
        "data": [
            "JJJJJJJ.7.7.7.JJJJJJJ",
            "JJJJJJJ.......JJJJJJJ",
            "JJJJJJJ.......JJJJJJJ",
            "JJJJJJJ.......JJJJJJJ",
            "FFYY.............YYFF",
            "FFYY.............YYFF",
            ".....................",
            "......NNNNNNNNN......",
            "YY......2.2.2......YY",
            "YY.................YY",
            "....o.....o.....o....",
            ".....................",
            ".....................",
            "FFN...FF.....FF...NFF",
            "FFN...YY.....YY...NFF",
            "FFN...............NFF",
            "FFN...............NFF",
            "FFN...............NFF",
            "FFN...YY.....YY...NFF",
            "FFN...FF.....FF...NFF",
            ".....................",
            ".....................",
            "....o.....o.....o....",
            "YY.................YY",
            "YY......1.1.1......YY",
            "......NNNNNNNNN......",
            ".....................",
            "FFYY.............YYFF",
            "FFYY.............YYFF",
            "JJJJJJJ.......JJJJJJJ",
            "JJJJJJJ.......JJJJJJJ",
            "JJJJJJJ.......JJJJJJJ",
            "JJJJJJJ.6.6.6.JJJJJJJ"
        ]
    },
    {
        "name": "jump-park",
        "displayName": "Jump Park",
        "gameMode": "showdown",
        "data": [
            ".................WW............M.....M..xxxMxxxxMMxxxxMMxx..",
            "xxxxxH.H.H.H.P.H.WWH.H.H.H.H.H.MH.H..MH.xxxMxxxxMMxxxxMMxx..",
            "xxxxx............WW............M.....M..xxxMxxxxMM4.O.O.O...",
            "xxxxxH.H.H..2.2H.WWH.H.H.H.H.H.MH.H.4MH.xxxMxxxxMM4.........",
            "xxxxx............WW............M....4M..xxxMxxxxMM..YYO.O...",
            "xxxxxH.H.H.H.P.H.WWH.P.H.H.H.H.MH.P..MH.xxxMxxxxMMMMMM......",
            "xxxxx............WW............M.....M..xxxMxxxxO.O.O.O.O...",
            "xxxxxWWWWxxxxWWWWWWCCYYY...MMMMMMM...MMMxxxMxxxx............",
            "xxxxxWWWWxxxxWWWWWWNNNNNxxxxxxxxxxxxZ.Z.Z.Z.K.K..2.2L.YYG...",
            "xxxxxNNNNxxxxWWWWWWZ.Z.xxxxxxxxxxxxx...................Y....",
            "xxxxxYYCCxxxxWWWWWW....xxxx.....xxxxCCYYU.U.K.K.Z.Z.L..YG...",
            "..K.U.K.K.xxxG.G.G.G.G.xxxx.444.xxxxCYYY...............Y....",
            "..........xxx..........xxxx.....xxxCYYZ.K.K.O.O.K.K.YYYYG...",
            "..K.U.K.K.xxxG.G.G.G.YYYxxxxxxxxxxxYYY..............YYYY....",
            "..........xxx........YYYxxxxxxxxxxxYZ.Z.K.K.CYCCYYYYYYZ.Z...",
            "M.K.K.CYYYCCCYYL.CCYYYYYNNNNxxxxNNNN........YYYYYYCCCC......",
            "M.....NNNNNNNYY..YYYO.O.O.O.K.K.K.G.G.G.G.CYYYYYK.K.K.Z.Z...",
            "MMK.K.O.O.O.MMMMMMMM......................YYYC44............",
            "MM..........MMMMMMMMM4Z.Z.Z.L.L.L.Z.G.G.G.YYO.O.K.K.K.K.K...",
            ".4L.L.O.O.O.MMMMMMMMM4....................CC................",
            ".4..........MMYMMYNNNNNNNNNaaaaaaNNNNNNNO.O.O.O.K.K.K.K.K.FF",
            "xxL.L.L..CYMMCCMMTYCCCYYYCxxxxxxxxxCCYYY..................FF",
            "xx......CYYMK.Z.Z.Z.G.G.G.G.Z.Z.Z.G.G.G.G.WWWTxxxxxxxxxxxxFM",
            "xxYYYYYYYYYY..............................WWWWxxxxxxxxxxxxFM",
            "xxP.P.P.CCL.O.O.O.O.L.L.O.O.O.G.G.G.G.G.G.WWWWxxxxxxxxxxxxMM",
            "xx......CC................................NWWWxxxCCxxxxxxxMM",
            "xxP.P.P.L.L.O.O.YYYYL.L.O.O.O.G.L.G.Z.Z.Z.NWWWxxxCCxxxCCMMMM",
            "xx..............YYFF......................NWWWxxxxxxxxCCMMMM",
            "MFL.L.xxxxxxxxTWWWP.L.L.P.xxxxxxxxCCWWWWZ.NWWWxxxxxxxxK.K.MM",
            "MF....xxxxxxxxWWWW........xxWWWWxxCCWWWW..WWWWxxxxxxxx....MM",
            "MML.L.xxxxxxxxWWWWP.WWWWCCxxWWWWxxZ.K.K.Z.WWWWxxxxxxxxK.K.FM",
            "MM....xxxxxxxxWWWN..WWWWCCxxxxxxxx........WWWTxxxxxxxx....FM",
            "MMMMCCxxxxxxxxWWWNP.P.P.H.K.H.U.U.U.K.K.FFYYU.U.K.K.Z.Z.Z.xx",
            "MMMMCCxxxCCxxxWWWN......................YYYY..............xx",
            "MMxxxxxxxCCxxxWWWNH.H.H.H.H.H.U.U.U.K.K.U.U.U.U.K.CCZ.Z.Z.xx",
            "MMxxxxxxxxxxxxWWWW................................CC......xx",
            "MFxxxxxxxxxxxxWWWWH.H.H.H.P.P.P.H.H.H.H.P.P.P.L.YYYYYYYYYYxx",
            "MFxxxxxxxxxxxxTWWW..............................MYYCK.K.K.xx",
            "FFL.L.L.L.L.U.U.U.U.YYYCCxxxxxxxxxCYYYCCCYTM2.2MMYC.......xx",
            "FF..................NNNNNNNaaaaaaNNNNNNNNNYMMYMMU.U.U.K.K.4.",
            "..L.L.L.L.L.U.U.CCH.H.H.P.K.K.K.P.P.P.4MMMMMMMMM..........4.",
            "................YY....................4MMMMMMMMMU.U.U.L.L.MM",
            "..P.P.L.L.L.4.CYYYH.H.H.H.L.L.L.U.U.U.U.MMMMMMMM..........MM",
            "............YYYYYC......................YYYK.YYNNNNNNNL.L..M",
            "..P.P.CCCCYYYYYYL.L.P.P.NNNNxxxxNNNNYYYYYCC..YYCCCYYYC.....M",
            "......YYYYYYCCYC........YxxxxxxxxxxxYYYH.H.H.H.xxxL.L.O.L...",
            "..H.YYYYL.L.U.U.L.L.P.YYYxxxxxxxxxxxYYY........xxx..........",
            "....YYYY..............YYCxxx.....xxxxH.H.H.H.H.xxxL.L.O.L...",
            "..H.Y.K.P.P.L.L.O.O.YYYCxxxx.444.xxxx..........xxx..........",
            "....Y...............YYCCxxxx.....xxxxP.P.WWWWWWxxxxCCYYxxxxx",
            "..H.Y.K.....L.L.P.P.P.P.xxxxxxxxxxxxx....WWWWWWxxxxNNNNxxxxx",
            "....YY..2.2.............xxxxxxxxxxxxNNNNNWWWWWWxxxxWWWWxxxxx",
            "..U.U.U.U.U.xxxxMxxxMMM...MMMMMMM...YYYCCWWWWWWxxxxWWWWxxxxx",
            "............xxxxMxxxG.M.Z.G.MG.G.G.G.Z.G.WWG.Z.G.G.G.G.xxxxx",
            "..U.U.MMMMMMxxxxMxxx..M.....M............WW............xxxxx",
            "......YY..MMxxxxMxxxG.M4G.G.MG.G.G.G.G.G.WWG.....G.G.G.xxxxx",
            "..U.U.U..4MMxxxxMxxx..M4....M............WW..2.2.......xxxxx",
            ".........4MMxxxxMxxxG.M.G.G.MG.G.G.G.G.G.WWG.Z.G.G.G.G.xxxxx",
            "..xxMMxxxxMMxxxxMxxx..M.....M............WW............xxxxx",
            "..xxMMxxxxMMxxxxMxxx..M.....M............WW................."
        ]
    },
    {
        "name": "brawler-speedway",
        "displayName": "Brawler Speedway",
        "gameMode": "showdown",
        "data": [
            "FFFFFFFFFFFFFFFFFMMMT...TMMMMMMMMMMT...TMMMFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFMMM.......MMMMMM.......MMMFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFF..............TMMT..............FFFFFFFFFFFFFF",
            "FFFFFFFFFFFzzzzzzzzzzzzz....2.2.....zzzzzzzzzzzzzFFFFFFFFFFF",
            "FFFFFFFF.zzzzTzzzzzzzzzzzz........zzzzzzzzzzzzTzzzz.FFFFFFFF",
            "FFFFFF..zzzzwwwwwwwwwzzzTzzz.ww.zzzTzzzwwwwwwwwwzzzz..FFFFFF",
            "FFFF...zzTwwwwwwwwwwwwwwzzzzwwwwzzzzwwwwwwwwwwwwwwTzz...FFFF",
            "FFFF..TzzwwwwwwwwzzwwwwwwwzzwwwwzzwwwwwwwzzwwwwwwwwzzT..FFFF",
            "FFF..zzzwwwwzzzzzzzzzwwwwwwwwwwwwwwwwwwzzzzzzzzzwwwwzzz..FFF",
            "FFF..zzwwwwzzzzzzTzzzvvvvwwwwwwwwwwvvvvzzzTzzzzzzwwwwzz..FFF",
            "FF...zwwwwzzT.vvvMMMMvvvwwwww44wwwwwvvvMMMMvvv.Tzzwwwwz...FF",
            "FF..zzwwwzzz..vvvMMMMvvwwwwwwwwwwwwwwvvMMMMvvv..zzzwwwzz..FF",
            "FF..zzwwzzzz..vvvMMwwwwwwwwwzzzzwwwwwwwwwMMvvv..zzzzwwzz..FF",
            "MM.zzwwwzzzzz.vvwwwwwwwwwwzzzzzzzzwwwwwwwwwwvv.zzzzzwwwzz.MM",
            "MM.zzwwwwzzzzzwwwwwwwwwwzzzzzvvzzzzzwwwwwwwwwwzzzzzwwwwzz.MM",
            "...zzwwwwwzzzwwwww4wwwzzzzvvvvvvvvzzzzwww4wwwwwzzzwwwwwzz...",
            ".2.2.wwwwwwwwwwwwwwwzzzzzvvvvvvvvvvzzzzzwwwwwwwwwwwwwww.2.2.",
            ".....wwwwwwwwwwwwwzzzzzWWWW......WWWWzzzzzwwwwwwwwwwwww.....",
            ".....zzwwwwwwwvvzzzzzzzWWWW......WWWWzzzzzzzvvwwwwwwwzz.....",
            "...zzzzzzwwwwwvvzzzzzFFWWWW..44..WWWWFFzzzzzvvwwwwwzzzzzz...",
            "F..zzzzzzzzwwwwwwzzzzFFvv....44....vvFFzzzzwwwwwwzzzzzzzz..F",
            "F...zzzzzzzzwwwwwwzzzzvvv..........vvvzzzzwwwwwwzzzzzzzz...F",
            "FF..vvvvvvzzzwwwwwwwzzvvvv........vvvvzzwwwwwwwzzzvvvvvv..FF",
            "FFF.vvvvvvvvvvvwwwwwwwwvvvv......vvvvwwwwwwwwvvvvvvvvvvv.FFF",
            "MFF..NNNvvvvvvvvwwwwwwwvvvvM....MvvvvwwwwwwwvvvvvvvvNNN..FFM",
            "MFF..WWWWvvvvvvvvwwwwwwwvvvMMMMMMvvvwwwwwwwvvvvvvvvWWWW..FFM",
            "MMF..WWWWWvvvvvvvzzwwwwwzz........zzwwwwwzzvvvvvvvWWWWW..FMM",
            "MMF...WWWWWvvvvvvzzzwwwwzzz......zzzwwwwzzzvvvvvvWWWWW...FMM",
            "MMY....WWWW...FFF.zzzwwwwzzz.FF.zzzwwwwzzz.FFF...WWWW....YMM",
            "MMYC...WWWW...FFMMMzzwwwwwzz.FF.zzwwwwwzzMMMFF...WWWW...CYMM",
            "MMYC...WWWW...FFMMMzzwwwwwzz.FF.zzwwwwwzzMMMFF...WWWW...CYMM",
            "MMY....WWWW...FFFzzzwwwwwzzz.FF.zzzwwwwwzzzFFF...WWWW....YMM",
            "MMF...WWWWWvvvvvvzzwwwwwzzz......zzzwwwwwzzvvvvvvWWWWW...FMM",
            "MMF..WWWWWvvvvvvzzww44wwzz........zzww44wwzzvvvvvvWWWWW..FMM",
            "MFF..WWWWvvvvvvzzzwwwwwwvvvMMMMMMvvvwwwwwwzzzvvvvvvWWWW..FFM",
            "MFF..NNNvvvvzzzzzwwwwwwvvvvM....MvvvvwwwwwwzzzzzvvvvNNN..FFM",
            "FFF.vvvvvvvzzzzwwwwwzzvvvv........vvvvzzwwwwwzzzzvvvvvvv.FFF",
            "FF..vvvvzzzzzwwwwwwzzzvv............vvzzzwwwwwwzzzzzvvvv..FF",
            "FF..vvzzzzzzwwwwwwzzzvvv.....44.....vvvzzzwwwwwwzzzzzzvv..FF",
            "F....zzzzzwwwwwwwzzzvvvFF..........FFvvvzzzwwwwwwwzzzzz....F",
            "F...zzzzwwwwwwvvzzzzvvvFFF........FFFvvvzzzzvvwwwwwwzzzz...F",
            "....zzzzwwwwwwvvzzzzzvvvFFFWWWWWWFFFvvvzzzzzvvwwwwwwzzzz....",
            "....zzzzwwwwwwwwwwzzzzvvvvWWWWWWWWvvvvzzzzwwwwwwwwwwzzzz....",
            ".....zzwwwwwwwwwwwwwzzzvvvWWWWWWWWvvvzzzwwwwwwwwwwwwwzz.....",
            ".....zzwwwwwwwwwwwwwwwwwwwzWWWWWWzwwwwwwwwwwwwwwwwwwwzz.....",
            "MM..2.2wwwwzzzwwwwwwwwwwwwzzWWWWzzwwwwwwwwwwwwzzzwwww2.2..MM",
            "MM.....wwwzzzzzzwwwwwwwwwwwzzzzzzwwwwwwwwwwwzzzzzzwww.....MM",
            "FF...zzwwwzzzzzzzzMMwwwwwwwwzzzzwwwwwwwwMMzzzzzzzzwwwzz...FF",
            "FF...zzwwwwzzzzz..MMMwwwwwwwwwwwwwwwwwwMMM..zzzzzwwwwzz...FF",
            "FF...zzTwwwwzzzz..T..vvvwwwww44wwwwwvvv..T..zzzzwwwwTzz...FF",
            "FFF..zzzwwwwTzzzz.....vvvzwwwwwwwwzvvv.....zzzzTwwwwzzz..FFF",
            "FFF...zzzwwwwwzzzzz....vvzzwwwwwwzzvv....zzzzzwwwwwzzz...FFF",
            "FFFF..zzzzwwwwwwwzzzzz..vvzzwwwwzzvv..zzzzzwwwwwwwzzzz..FFFF",
            "FFFF...zzTzwwwwwwwwzzzzzvvzzwwwwzzvvzzzzzwwwwwwwwzTzz...FFFF",
            "FFFFFF..zzzzzzwwwwwwwzzzTzwwwwwwwwzTzzzwwwwwwwzzzzzz..FFFFFF",
            "FFFFFFFF.zzzzzTzwwwwwwwwwwwwwwwwwwwwwwwwwwwwzTzzzzz.FFFFFFFF",
            "FFFFFFFFFFF.zzzzzzzzwwwwwwwzz44zzwwwwwwwzzzzzzzz.FFFFFFFFFFF",
            "FFFFFFFFFFFFFFzzzzzzzzzzzzzzTMMTzzzzzzzzzzzzzzFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFMMMzzzzzzzMMMMMMzzzzzzzMMMFFFFFFFFFFFFFFFFF",
            "FFFFFFFFFFFFFFFFFMMMT...TMMMMMMMMMMT...TMMMFFFFFFFFFFFFFFFFF"
        ]
    },
    {
        "name": "tornado-ring",
        "displayName": "Tornado Ring",
        "gameMode": "heist",
        "data": [
            "NNNN....2.2.2....NNNN",
            "C................RRRC",
            "RR...............RRRR",
            "RR.................RR",
            "RRR.......8........RR",
            "RRRXM..............RR",
            "RRRXX..............RR",
            "RR...........YY.....M",
            "RR......RRNNNCY.....M",
            "MM...YY.RRCWWWW....RM",
            "M....CCRRRRWWWW....RR",
            "M...RRRRRRRRRR...RRRR",
            "....RRRRRRRRR....RRRR",
            "....MRRRR........RRCC",
            "...MMRR......MMM...MM",
            "....RRR.......TT....M",
            "....RR.........RR....",
            "M....TT.......RRR....",
            "MM...MMM......RRMM...",
            "CCRR........RRRRM....",
            "RRRR....RRRRRRRRR....",
            "RRRR...RRRRRRRRRR...M",
            "RR....WWWWRRRRCC....M",
            "MR....WWWWCRR.YY...MM",
            "M.....YCNNNRR......RR",
            "M.....YY...........RR",
            "RR..............XXRRR",
            "RR..............MXRRR",
            "RR........8.......RRR",
            "RR.................RR",
            "RRRR...............RR",
            "CRRR................C",
            "NNNN....1.1.1....NNNN"
        ]
    },
    {
        "name": "flying-fantasies",
        "displayName": "Flying Fantasies",
        "gameMode": "showdown",
        "data": [
            "WWWWWWWWWWWWWWWWWNNNNNRRRRRRRRRRRRRRRRNNNNNWWWWWWWWWWWWWWWWW",
            "W.........TWWWWWWYRRRRRRRRRRRRRRRRRRRRRRRRYWWWWWWT.........W",
            "W............................44............................W",
            "W.....RRR.................L....DL............D.....RRR.....W",
            "W...RRRRRR........................................RRRRRR...W",
            "W...RRRRTRR.........NT.......CC.......TN.........RRTRRRR...W",
            "W..RRRWWWWR.........NWWWWWWWWWWWWWWWWWWN.........RWWWWRRR..W",
            "W..RRRWWWWR.........NWWWWWWWWWWWWWWWWWWN.........RWWWWRRR..W",
            "W..RRTWWWWW..1......NWW..TNNNNNNNNT..WWN......1..WWWWWTRR.DW",
            "W...RRWWWWWNNN......NWW....RRRRRR....WWN......NNNWWWWWRR...W",
            "WT...RRRWWWWWT4.....NWW.4D.........4.WWN.....4TWWWWWRRR...TW",
            "WW..2.2.WWWWW.......NWW......1.......WWN.......WWWWW.2.2..WW",
            "WW.D.......WW.......NT................TN.......WW.......D.WW",
            "WW.........WWRRRR..................D.......RRRRWW.........WW",
            "WW.........WWYYRR..D....................D..RRYYWW.........WW",
            "WT........4WW...........MMRRRYYRRRMM...........WW4........TW",
            "W.....1...NWW...........RRRRRMMRRRRR...........WWN...1.....W",
            "W.........NWW..................................WWN.........W",
            "W.........NWW..................................WWN.........W",
            "W.......P.NWWRRRRM........C......C........MRRRRWWNO........W",
            "W..D......NWWRRRRTP..4.NNNY......YNNN.4.O.TRRRRWWN......D..W",
            "W.........NNNN........WWWWWW....WWWWWW........NNNN.........W",
            "W.....RRRRMMD......4..WWWWWW....WWWWWW..4......DMMRRRR.....W",
            "W.....RRYYM..........WWWRR........RRWWW..........MYYRR.....W",
            "WNNT...............WWWWWRR........RRWWWWW...D...........TNNW",
            "WWW................WWWTD.............TWWW................WWW",
            "WWW................WWWY.....TMMT....DYWWW................WWW",
            "WRR................NNNN.....RRRR.....NNNN................RRW",
            "WRR.........RRRR.............44..................RRRR....RRW",
            "WRR..4.MMRR.RR.M............................MMRR.RRMM.4..RRW",
            "WRR..4.MMRR.RRMM............................M.RR.RRMM.4..RRW",
            "WRR....RRRR.D................44.............RRRR.........RRW",
            "WRR................NNNN..D..RRRR.....NNNN................RRW",
            "WWW.2.2............WWWY.....TMMT.....YWWW............2.2.WWW",
            "WWW............D...WWWT........D.....TWWW................WWW",
            "WNNT...............WWWWWRR........RRWWWWW...............TNNW",
            "W.....RRYYM..........WWWRR........RRWWW.......D..MYYRR.....W",
            "W.....RRRRMMD......4..WWWWWW....WWWWWW..4......DMMRRRR.....W",
            "W.D.......NNNN....U...WWWWWW....WWWWWW..Z.....NNNN.........W",
            "W.......U.NWWRRRRT...4.NNNY......YNNN.4...TRRRRWWNZ.....D..W",
            "W.........NWWRRRRM........C......C........MRRRRWWN.........W",
            "W.........NWW..................................WWN.........W",
            "W.........NWW..................................WWN.........W",
            "WD....1...NWW...........RRRRRMMRRRRR...........WWN...1.....W",
            "WT........4WW...........MMRRRYYRRRMM...........WW4........TW",
            "WW.........WWYYRR..D....................D..RRYYWW.........WW",
            "WW.........WWRRRR..........................RRRRWW.........WW",
            "WW.D.......WW.......NT............D...TN.......WW.......D.WW",
            "WW......WWWWW.......NWW.......1......WWN.......WWWWW.....DWW",
            "WT...RRRWWWWWT4.....NWW.4D...2.2...4.WWN.....4TWWWWWRRR...TW",
            "W...RRWWWWWNNN......NWW....RRRRRR....WWN......NNNWWWWWRR...W",
            "W..RRTWWWWW..1......NWW..TNNNNNNNNT..WWN......1..WWWWWTRR..W",
            "W..RRRWWWWR.........NWWWWWWWWWWWWWWWWWWN.........RWWWWRRR..W",
            "W..RRRWWWWR.........NWWWWWWWWWWWWWWWWWWN.........RWWWWRRR..W",
            "W...RRRRTRR.........NT.......CC.......TN.........RRTRRRR...W",
            "W...RRRRRR.....D..........K.....K.................RRRRRR...W",
            "W..D..RRR..........................................RRR.....W",
            "W............................44............................W",
            "W.........TWWWWWWYRRRRRRRRRRRRRRRRRRRRRRRRYWWWWWWT.........W",
            "WWWWWWWWWWWWWWWWWNNNNNRRRRRRRRRRRRRRRRNNNNNWWWWWWWWWWWWWWWWW"
        ]
    },
    {
        "name": "boxed-in",
        "displayName": "Boxed In",
        "gameMode": "showdown",
        "data": [
            "...........................NNNNNMMMMMMM......WWWWWWWWWWMM...",
            "......4.........1.............YYMMMM.........WWWWWWWWWWMM...",
            "..4.......MMM...................MMM..........WWWWW.....M....",
            "..........MMMMMMM...............MMM..1......................",
            "M...N.........MMM....4MRRR......MM4.........................",
            "MMNNN...........M...MMMRRR......MM.........RRR..............",
            "MMM.....2.2.........MMRRR..................MRR.......2.2....",
            "M...................RRRRR..................MM...............",
            "....1......RRM......RR..........xxxxxxxxxx.......C..........",
            "..........RRMM...............YYYMM.xxxxxxxxx...WWWW.........",
            "..........RRMMMC.......CCMMMMMMMMM....xxxxxxxxxWWWW.........",
            "MR.................RR..................RRxxxxxxxxWWMMM......",
            "MRRR.............RRRR..................RRRRxxxxxxx.........R",
            "MMRRRRWWWW.......RRMMMMMMMM............RRRRRRxxxxxx.....1..R",
            "MMMRRRWWWW......RRRM4..................MMMM44..xxxxx4......R",
            "MMMRR...WW......RRRM.....................MMMMRRRxxxxx.....RR",
            "MMMM....MM......RRRMMM...MMRRR.............MMRRRRxxxx....RRR",
            "..MM...........RRRRRRRRRRRRRRRR.............MRR...xxxx....RR",
            "...M...........RRRRRRRxxxxxxxRRx.x.4...............xxx.T..RR",
            "......x....MM...RRRRxxxxxxxxxxx.....xT..............xxx...RR",
            ".........MMMR....RRxxxxxxxxxxxxx.......x............x4x...RR",
            ".1.......MMRR....xxxxYYY...xxxxxx........x...........Txx...R",
            "........MMRR.....xx..........xxxxR.......4......MM....xx...R",
            "........MMRR.....x.......4...xxxxRR......Tx......MM........M",
            "....x..MMMR..M..x....4.......MxxxRRNNN.....x..x...MM...x...M",
            "....4..MMRR.MM..x............MxxRRRC.......x......MM...xx...",
            "M..T...M....M..x........MMMMMMxxRR.......RRRx......MM..Tx...",
            "M..x.........................4xx.........MMMx......MM...x...",
            "Y..............x.......................WWWWWx.......M...x4..",
            "...x...........xWW..............MMM....WWWWWx...............",
            "...............xWWWWW....MMM..............WWx...........x...",
            "..4x...M.......xWWWWW.......................x..............Y",
            "...x...MM......xMMM.........xx4.........................x..M",
            "...xT..MM......xRRR.......RRxxMMMMMM........x..M....M...T..M",
            "...xx...MM......x.......CRRRxxM............x..MM.RRMM..4....",
            "M...x...MM...x..x.....NNNRRxxxM.......4....x..M..RMMM..x....",
            "M........MM......xT......RRxxxx...4.......x.....RRMM........",
            "R...xx....MM......4.......Rxxxx..........xx.....RRMM........",
            "R...xxT...........x........xxxxxx...YYYxxxx....RRMM.......1.",
            "RR...x4x............x.......xxxxxxxxxxxxxRR....RMMM.....2.2.",
            "RR...xxx..............Tx.....xxxxxxxxxxxRRRR...MM....x......",
            "RR..T.xxx...............4.x.xRRxxxxxxxRRRRRRR...........M...",
            "RR....xxxx...RRM.............RRRRRRRRRRRRRRRR...........MM..",
            "RRR....xxxxRRRRMM.............RRRMM...MMMRRR......MM....MMMM",
            "RR.....xxxxxRRRMMMM.....................MRRR......WW...RRMMM",
            "R......4xxxxx..44MMMM..................4MRRR......WWWWRRRMMM",
            "R..1.....xxxxxxRRRRRR............MMMMMMMMRR.......WWWWRRRRMM",
            "R.........xxxxxxxRRRR..................RRRR.............RRRM",
            "......MMMWWxxxxxxxxRR..................RR.................RM",
            ".........WWWWxxxxxxxxx....MMMMMMMMMCC.......CMMMRR..........",
            "..2.2....WWWW...xxxxxxxxx.MMYYY...............MMRR..........",
            "..........C.......xxxxxxxxxx..........RR......MRR......1....",
            "...............MM..................RRRRR...................M",
            "..............RRM..................RRRMM.................MMM",
            "..............RRR.........MM......RRRMMM...M...........NNNMM",
            ".........................4MM......RRRM4....MMM.........N...M",
            "......................1..MMM.2.2...........MMMMMMM..........",
            "....M.....WWWWW..........MMM...................MMM.......4..",
            "...MMWWWWWWWWWW.........MMMMYY.............1.........4......",
            "...MMWWWWWWWWWW......MMMMMMMNNNNN..........................."
        ]
    },
    {
        "name": "duality",
        "displayName": "Duality",
        "gameMode": "gemgrab",
        "data": [
            "........2.2.2........",
            ".....................",
            "..................RRR",
            "..................RRR",
            "...MXRR.........MMMRR",
            "...MMRR...........XRR",
            "...MMRR............RR",
            ".RRRRRRRRRRR.......RR",
            ".RRRRRRRRRRR........R",
            ".RR.....MMRR........R",
            "XRRWW...MMRR...M....R",
            "XRRWWW....RR..MM.....",
            ".RRWWW.......MM......",
            ".RRXWW........X......",
            ".....................",
            ".....................",
            "T.........8.........T",
            ".....................",
            ".....................",
            "......X........WWXRR.",
            "......MM.......WWWRR.",
            ".....MM..RR....WWWRRX",
            "R....M...RRMM...WWRRX",
            "R........RRMM.....RR.",
            "R........RRRRRRRRRRR.",
            "RR.......RRRRRRRRRRR.",
            "RR............RRMM...",
            "RRX...........RRMM...",
            "RRMMM.........RRXM...",
            "RRR..................",
            "RRR..................",
            ".....................",
            "........1.1.1........"
        ]
    },
    {
        "name": "dont-turn-around",
        "displayName": "Don't turn around",
        "gameMode": "bounty",
        "data": [
            "........2.2.2........",
            ".....................",
            ".....................",
            "................CC..R",
            "....................R",
            "....................R",
            "..................e.R",
            ".e.......MMXM.......T",
            "T........RRMM.....aaa",
            "MXXMM....RRMX....WWWW",
            "MX.....RRRRRR....WWWW",
            "MM.....RRRRRR......WW",
            ".......XM............",
            ".....MMMM.....XMRRR..",
            "..............MMRRR..",
            ".....................",
            "..........8..........",
            ".....................",
            "..RRRMM..............",
            "..RRRMX.....MMMM.....",
            "............MX.......",
            "WW......RRRRRR.....MM",
            "WWWW....RRRRRR.....XM",
            "WWWW....XMRR....MMXXM",
            "aaa.....MMRR......c.T",
            "Tc......MXMM.........",
            "R....................",
            "R....................",
            "R....................",
            "R..CC................",
            ".....................",
            ".....................",
            "........1.1.1........"
        ]
    },
    {
        "name": "some-assembly-required",
        "displayName": "Some Assembly Required",
        "gameMode": "siege",
        "data": [
            "...YY......2.2.2......YY...",
            "...YY.................YY...",
            "...YC...Y.........Y...CY...",
            "........Y....8....Y........",
            "...........................",
            "..YY...................YY..",
            "..YY....Y.........Y....YY..",
            "........YY.......YY........",
            "...........................",
            "....CC...............CC....",
            "....CC...............CC....",
            "........M.........M........",
            "........MM.......MM........",
            "............MMM............",
            "MMM.....................MMM",
            "RRR.....................RRR",
            "RRRR...TT...TTT...TT...RRRR",
            "RRRR.g.......g.......g.RRRR",
            "RR.......................RR",
            "RR.TT..TT.g.TTT.g.TT..TT.RR",
            "RR.......................RR",
            "RRRR.g.......g.......g.RRRR",
            "RRRR...TT...TTT...TT...RRRR",
            "RRR.....................RRR",
            "MMM.....................MMM",
            "............MMM............",
            "........MM.......MM........",
            "........M.........M........",
            "....CC...............CC....",
            "....CC...............CC....",
            "...........................",
            "........YY.......YY........",
            "..YY....Y.........Y....YY..",
            "..YY...................YY..",
            "...........................",
            "........Y....8....Y........",
            "...YC...Y.........Y...CY...",
            "...YY.................YY...",
            "...YY......1.1.1......YY..."
        ]
    }
]

const tileImages = {
    ".":"",
    "D":"",
    "b":"",
    "Q":"",
    "R":"bush",
    "2":"spawn_point_enemy",
    "M":"barrier_01",
    "X":"barrier_02",
    "B":"skull",
    "1":"spawn_point_team",
    "C":"barrier_03",
    "Y":"barrier_04",
    "N":"fence",
    "T":"barrier_05",
    "F":"bush",
    "4":"power_cube_box",
    "W":"water",
    "I":"indestructible",
    "5":"heist_safe",
    "H":"jump_pad_right",
    "G":"jump_pad_left",
    "8":"",
    "g":"bolt_spawn",
    "P":"jump_pad_down_right",
    "Z":"jump_pad_up_left",
    "L":"jump_pad_down",
    "K":"jump_pad_up",
    "O":"jump_pad_down_left",
    "U":"jump_pad_up_right",
    "a":"rope_fence",
    "c":"teleporter_blue",
    "d":"teleporter_green",
    "e":"teleporter_red",
    "f":"teleporter_yellow",
    "v":"spikes",
    "y":"heal_pad",
    "x":"poison",
    "J":"brawl_ball_oob",
    "7":"spawn_point_enemy",
    "6":"spawn_point_team",
    "w":"fast",
    "z":"slow",
    "o":"bumper"
};

const gameModeObjectives = {
    "default":{
        "image":"",
        "width":"20px",
        "color1":"#f8a674",
        "color2":"#ed9e6e"
    },
    "gemgrab":{
        "image":"gem_mine",
        "width":"40px",
        "color1":"#f8a674",
        "color2":"#ed9e6e"
    },
    "brawlball":{
        "image":"brawl_ball",
        "width":"27px",
        "color1":"#3c9657",
        "color2":"#388e52"
    },
    "heist":{
        "image":"heist_safe",
        "width":"40px",
        "color1":"#f8a674",
        "color2":"#ed9e6e"
    },
    "bounty":{
        "image":"bounty_star",
        "width":"25px",
        "color1":"#f8a674",
        "color2":"#ed9e6e"
    },
    "siege":{
        "image":"siege_ike",
        "width":"47px",
        "color1":"#2d274a",
        "color2":"#302a4f"
    },
    "siegered":{
        "image":"siege_ike_red",
        "width":"47px",
        "color1":"#2d274a",
        "color2":"#302a4f"
    },
    "hotzone":{
        "image":"hot_zone",
        "width":"141px",
        "color1":"#f8a674",
        "color2":"#ed9e6e"
    }
}

const defualtAlign = {"justifyContent":"flex-end", "alignItems":"stretch", "width":"20px"};
const cactusAlign = {"justifyContent":"flex-end", "alignItems":"center", "width":"23px"};
const poisonAlign = {"justifyContent":"flex-end", "alignItems":"center", "width":"33px"};
const objectiveAlign = {"justifyContent":"center", "alignItems":"center", "width":"20px"};
const spawnAlign = {"justifyContent":"center", "alignItems":"center", "width":"34px"};
const jumpPadAlign = {"justifyContent":"flex-start", "alignItems":"flex-start", "width":"38px"};
const teleporterAlign = {"justifyContent":"flex-start", "alignItems":"flex-start", "width":"40px"};

const tileImageAlignments = {
    "default": defualtAlign,
    "T": cactusAlign,
    "2": spawnAlign,
    "1": spawnAlign,
    "H": jumpPadAlign,
    "G": jumpPadAlign,
    "8": objectiveAlign,
    "P": jumpPadAlign,
    "Z": jumpPadAlign,
    "L": jumpPadAlign,
    "K": jumpPadAlign,
    "O": jumpPadAlign,
    "U": jumpPadAlign,
    "c": teleporterAlign,
    "d": teleporterAlign,
    "e": teleporterAlign,
    "f": teleporterAlign,
    "y": teleporterAlign,
    "x": poisonAlign
};

for (let y of allData){
    if (y.name != ""){
        renderMap(y);
    }
}

