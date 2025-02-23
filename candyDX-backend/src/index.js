const express = require("express");
const app = express();
const port = 3000;

const { getAllScores } = require("./services/kamaiService.js");
const { getAllChartEstimateDiff } = require("./services/divingfishService.js");

const getTop100Scores = async (userID) => {
  const response = await getAllScores(userID);

  if(response.data.success === false) {
    console.log("Error: ", response.data.message);
    return;
  }

  const pbs = response.data.body.pbs; // chartID, calculatedData.rate, scoreData.percent, songID
  const songs = response.data.body.songs; //id, title
  const charts = response.data.body.charts; //chartID, data.inGameID, songID, level, leveNum, versions (find first appearance)
  
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
      console.log(`${song.title} - ${pb.calculatedData.rate} - ${chart.levelNum} - no estimate diff`);
      return;
    }
    const targetDiff = targetChart.find(diff => diff.diff === chart.level);
    if (!targetDiff) {
      console.log(`${song.title} - ${pb.calculatedData.rate} - No matching difficulty found for this chart`);
      return;
    }
    console.log(`${song.title} - ${pb.calculatedData.rate} - ${chart.levelNum} - ${targetDiff.fit_diff}`);
  });
}


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/top100", async (req, res) => {
  const userID = req.query.userID;
  const top100Scores = await getTop100Scores(userID);
  res.json(top100Scores);
});



app.listen(port, () => {
  console.log(`candyDX listening at http://localhost:${port}`);
});