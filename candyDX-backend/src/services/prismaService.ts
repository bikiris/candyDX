const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const axios = require("axios");

const bindUser = async (discordID, kamaiID) => {
  try {
    if (await getUser(discordID)) {
      const user = await prisma.user.update({
        where: {
          discord_id: discordID,
        },
        data: {
          kamai_tachi_id: kamaiID,
        },
      });
    } else {
      const user = await prisma.user.create({
        data: {
          discord_id: discordID,
          kamai_tachi_id: kamaiID,
        },
      });
    }
    return true;
  } catch (e) {
    console.log("user binding failed", e);
  }

  return false;
};

const getUser = async (discordID) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        discord_id: discordID,
      },
    });
    if (user) {
      return user.kamai_tachi_id;
    }
  } catch (e) {
    console.log(`${discordID} user not found`)
  }

  return null;
  
};

module.exports = { bindUser, getUser };
