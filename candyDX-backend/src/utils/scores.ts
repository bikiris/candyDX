import logger from "../logger.ts";

import { getAllScores } from "../services/kamaiService.ts";
import { getAllChartEstimateDiff } from "../services/divingfishService.ts";

const CURRENT_VERSION = "prism";


async function  getProcessedScores (userID) {
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

const getOld35Scores = async (userID) => {
  const rawScores = await getProcessedScores(userID);

  if (!rawScores || rawScores.length === 0) {
    console.log("Error: ", rawScores.data.message);
    return;
  }

  const rawOldScores = rawScores.filter((score) => {
    return !score.version.includes(CURRENT_VERSION);
  });

  rawOldScores.sort((a, b) => {
    return b.rating - a.rating;
  });

  return rawOldScores.slice(0, 35);
}

const getNew15Scores = async (userID) => {
  const rawScores = await getProcessedScores(userID);

  if (!rawScores || rawScores.length === 0) {
    console.log("Error: ", rawScores.data.message);
    return;
  }

  const rawNewScores = rawScores.filter((score) => {
    return score.version.includes(CURRENT_VERSION);
  });

  rawNewScores.sort((a, b) => {
    return b.rating - a.rating;
  });

  return rawNewScores.slice(0, 15);
}

const getBest50Scores = async (userID) => {
  return [
    ...await getOld35Scores(userID),
    ...await getNew15Scores(userID)
  ]
}

export { getProcessedScores, getTop100Scores, getOld35Scores, getNew15Scores, getBest50Scores };