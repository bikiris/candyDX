const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const { getAllScores } = require("./services/kamaiService.js");
const { getAllChartEstimateDiff } = require("./services/divingfishService.js");
const { bindUser, getUser } = require("./services/prismaService.js");

const getTop100Scores = async (userID) => {
  const response = await getAllScores(userID);

  if(response.data.success === false) {
    console.log("Error: ", response.data.message);
    return;
  }

  const pbs = response.data.body.pbs; // chartID, calculatedData.rate, scoreData.percent, songID
  const songs = response.data.body.songs; //id, title
  const charts = response.data.body.charts; //chartID, data.inGameID, songID, level, leveNum, versions (find first appearance), difficulty {"Master", "Re:Master", "Expert", "DX Master", "Advanced", }
  
  pbs.sort((a, b) => {
    return b.calculatedData.rate - a.calculatedData.rate;
  });

  const top100pbs = pbs.slice(0, 100);
  const allFitDiff = await getAllChartEstimateDiff();

  top100pbs.forEach((pb) => {
    const song = songs.find((song) => song.id === pb.songID);
    const chart = charts.find((chart) => chart.chartID === pb.chartID);
    const chartID = chart.data.inGameID;
    const targetChart = allFitDiff[chartID];
    if(!targetChart || targetChart.length === 0) {
      //divingfish doesn't have this chart due to version difference
      console.log(`${song.title} - ${pb.calculatedData.rate} - ${chart.levelNum} - no estimate diff`);
      return;
    }
    const targetDiff = targetChart.find(diff => diff.diff === chart.level);
    if (!targetDiff) {
      //this happens due to levelNum changes in different game version
      console.log(`${song.title} - ${pb.calculatedData.rate} - ${chart.level} - ${chart.levelNum} - No matching difficulty found for this chart`);
      return;
    }
    console.log(`${song.title} - ${pb.calculatedData.rate} - ${chart.levelNum} - ${targetDiff.fit_diff}`);
  });
}

const RANK_DEFINITION = [
  {minAchv: 100.5, factor: 0.224, title: 'SSS+', maxAchv: 100.1},
  {minAchv: 100.0, factor: 0.216, title: 'SSS', maxAchv: 100.4999, maxFactor: 0.222},
  {minAchv: 99.5, factor: 0.211, title: 'SS+', maxAchv: 99.9999, maxFactor: 0.214},
  {minAchv: 99.0, factor: 0.208, title: 'SS', maxAchv: 99.4999},
  {minAchv: 98.0, factor: 0.203, title: 'S+', maxAchv: 98.9999, maxFactor: 0.206},
  {minAchv: 97.0, factor: 0.2, title: 'S', maxAchv: 97.9999},
  {minAchv: 94.0, factor: 0.168, title: 'AAA', maxAchv: 96.9999, maxFactor: 0.176},
  {minAchv: 90.0, factor: 0.152, title: 'AA', maxAchv: 93.9999},
  {minAchv: 80.0, factor: 0.136, title: 'A', maxAchv: 89.9999},
  {minAchv: 75.0, factor: 0.12, title: 'BBB', maxAchv: 79.9999, maxFactor: 0.128},
  {minAchv: 70.0, factor: 0.112, title: 'BB', maxAchv: 74.9999},
  {minAchv: 60.0, factor: 0.096, title: 'B', maxAchv: 69.9999},
  {minAchv: 50.0, factor: 0.08, title: 'C', maxAchv: 59.9999},
  {minAchv: 0.0, factor: 0.016, title: 'D', maxAchv: 49.9999},
];

const getRatingByLevelAndRank = (level, rank) => {
  const findRank = RANK_DEFINITION.find(r => {
    if(r.title === rank) {
      return true;
    }
    return false;
  });

  if(!findRank) {
    return "No rank found";
  }

  //console.log(findRank.title, findRank.factor, level);
  //console.log(Math.floor(findRank.factor * level * findRank.minAchv));


  // level = Number(level);

  return Math.floor(findRank.factor * level * findRank.minAchv);
}

const getNextRankByAchievement = (achievement) => {
  const findRankIndex = RANK_DEFINITION.findIndex( (rank) => {
    if(rank.minAchv <= achievement && (!rank.maxAchv || rank.maxAchv >= achievement)) {
      return true;
    }
    return false;
  });

  if(!findRankIndex || findRankIndex === 0) {
    console.log("top rank");
    return "No rank found";
  }

  //console.log(findRank.title, findRank.minAchv);
  return RANK_DEFINITION[findRankIndex-1].title;
}

const filterCloseScores = (scores) => {
  //99.9000 - 99.9999, 100.4000 - 100.4999
  const closeScores = scores.filter(score => (score.scoreData.percent >= 99.9 && score.scoreData.percent <= 99.9999) || (score.scoreData.percent >= 100.4000 && score.scoreData.percent <= 100.4999));
  return closeScores;
}

const getCloseScores = async (userID) => {
  const response = await getAllScores(userID);

  if(response.data.success === false) {
    console.log("Error: ", response.data.message);
    return;
  }

  const pbs = response.data.body.pbs; // chartID, calculatedData.rate, scoreData.percent, songID
  const songs = response.data.body.songs; //id, title
  const charts = response.data.body.charts; //chartID, data.inGameID, songID, level, leveNum, versions (find first appearance), difficulty {"Master", "Re:Master", "Expert", "DX Master", "Advanced", }
  
  const closeScores = filterCloseScores(pbs).sort((a, b) => {
    return b.calculatedData.rate - a.calculatedData.rate;
  });

  const finalResponse = closeScores.map((pb) => {
    const song = songs.find((song) => song.id === pb.songID);
    const chart = charts.find((chart) => chart.chartID === pb.chartID);
    const nextRank = getNextRankByAchievement(pb.scoreData.percent);
    const nextRating = getRatingByLevelAndRank(chart.levelNum, nextRank);
    console.log(`${song.title} - ${chart.levelNum} - ${pb.scoreData.percent} - ${pb.calculatedData.rate} - scorefixed: ${nextRank} - ${nextRating}`);
    return {
      title: song.title,
      level: chart.levelNum,
      percent: pb.scoreData.percent,
      rate: pb.calculatedData.rate,
      nextRank: nextRank,
      nextRating: nextRating,
    };
  }).sort((a, b) => {
    return b.nextRating - a.nextRating;
  })

  return finalResponse;
}


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/top100/", async (req, res) => {
  let {discordID, kamaiID} = req.body;
  if(discordID){
    kamaiID = await getUser(discordID);
  }
  if(!kamaiID) {
    res.json("No kamai ID found");
    return;
  }

  const top100Scores = await getTop100Scores(kamaiID);
  res.json(top100Scores);
});

app.get("/closeScores", async (req, res) => {
  let {discordID, kamaiID} = req.query;

  if(discordID){
    kamaiID = await getUser(discordID);
  }
  if(!kamaiID) {
    res.json("No kamai ID found");
    return;
  }
  const closeScores = await getCloseScores(kamaiID);
  res.json(closeScores);
});

app.post("/bindUser", async (req, res) => {
  const {discordID, kamaiID} = req.body;
  const response = await bindUser(discordID, kamaiID);
  res.json(response);
});

app.listen(port, () => {
  console.log(`candyDX listening at http://localhost:${port}`);
});