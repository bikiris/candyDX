const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const bindUser = async (discordID, kamaiID) => {
  try {
    if (getUser(discordID)) {
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
  } catch (e) {
    console.log(e);
  }

  return true;
};

const getUser = async (discordID) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        discord_id: discordID,
      },
    });
    return user;
  } catch (e) {
    console.log(e);
  }

  return null;
  
};

module.exports = { bindUser, getUser };
