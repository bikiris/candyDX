const axios = require("axios");

const getAllChartEstimateDiff = async () => {
  const API_URL = `https://www.diving-fish.com/api/maimaidxprober/chart_stats`;
  const response = await axios.get(API_URL);
  
  const chartStats = response.data.charts;
  return chartStats;
}

module.exports = { getAllChartEstimateDiff };