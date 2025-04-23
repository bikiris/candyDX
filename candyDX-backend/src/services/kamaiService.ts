import axios from "axios";

async function getAllScores (userID) {
  const API_URL = `https://kamai.tachi.ac/api/v1/users/${userID}/games/maimaidx/Single/pbs/all`
  const response = await axios.get(API_URL);

  return response;
}

async function getKamaiUser(user) {
  try {
    const API_URL = `https://kamai.tachi.ac/api/v1/users/${user}`;
    const response = await axios.get(API_URL);
    return response.data.body.id+"";

  } catch (e) {
    console.log(`Error: ${user} user not found`);
  }
  
  return null;
}

export { getAllScores, getKamaiUser };