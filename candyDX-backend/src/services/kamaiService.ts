const axios = require("axios");

const getAllScores = async (userID) => {
  const API_URL = `https://kamai.tachi.ac/api/v1/users/${userID}/games/maimaidx/Single/pbs/all`
  const response = await axios.get(API_URL);

  return response;
}

const getKamaiUser = async (user) => {
  try {
    const API_URL = `https://kamai.tachi.ac/api/v1/users/${user}`;
    const response = await axios.get(API_URL);
    return response.data.body.id+"";

  } catch (e) {
    console.log(`Error: ${user} user not found`);
  }
  
  return null;
}

module.exports = { getAllScores, getKamaiUser };