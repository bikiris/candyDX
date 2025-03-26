const logger = require("../logger");

const { getAllScores } = require("../services/kamaiService.js");
const { getAllChartEstimateDiff } = require("../services/divingfishService.js");


const getProcessedScores = async (userID) => {
  const rawDataFromKamai = await getAllScores(userID);

  if (rawDataFromKamai.data.success === false) {
    logger.error("Error: ", rawDataFromKamai.data.message);
    return;
  }

  const pbs = rawDataFromKamai.data.body.pbs; // chartID, calculatedData.rate, scoreData.percent, songID
  const songs = rawDataFromKamai.data.body.songs; //id, title
  const charts = rawDataFromKamai.data.body.charts; //chartID, data.inGameID, songID, level, leveNum, versions (find first appearance), difficulty {"Master", "Re:Master", "Expert", "DX Master", "Advanced", }

  const finalResponse = pbs.map((pb) => {
    const songData = songs.find((song) => song.id === pb.songID);
    const chartData = charts.find((chart) => chart.chartID === pb.chartID);
    //chart name(song title), chart difficulty(levelNum + difficulty), chart version, player percentage, rating
    return {
      title: songData.title,
      leve: chartData.level,
      internalLevel: chartData.levelNum,
      difficulty: chartData.difficulty,
      percent: pb.scoreData.percent,
      version: chartData.versions[0],
      rating: pb.calculatedData.rate,
    };
  });

  return finalResponse;
};

const getTop100Scores = async (userID) => {
  const rawScores = await getProcessedScores(userID);

  if (!rawScores || rawScores.length === 0) {
    console.log("Error: ", rawScores.data.message);
    return;
  }

  rawScores.sort((a, b) => {
    return b.rating - a.rating;
  });

  return rawScores.slice(0, 100);

  
};


module.exports = { getProcessedScores, getTop100Scores };