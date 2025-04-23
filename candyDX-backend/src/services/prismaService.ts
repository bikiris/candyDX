import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function bindUser (discordID, kamaiID) {
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

async function getUser(discordID) {
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

export { bindUser, getUser };
