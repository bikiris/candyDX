const axios = require("axios");

const getAllScores = async (userID) => {
  const API_URL = `https://kamai.tachi.ac/api/v1/users/${userID}/games/maimaidx/Single/pbs/all`
  const response = await axios.get(API_URL);

  return response;
}

module.exports = { getAllScores };