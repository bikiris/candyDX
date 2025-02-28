const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

const API_URL = process.env.API_URL;
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription('binding kamai ID')
    .addStringOption((option) =>
      option
        .setName('kamai')
        .setDescription('enter your kamai ID')
        .setRequired(true),
    ),
  async execute(interaction) {
    const embedResponse = new EmbedBuilder().setTitle('Binded User');
    try {
      await axios.post(API_URL + 'bindUser', {
        discordID: interaction.user.id,
        kamaiID: interaction.options.getString('kamai'),
      });
      logger.info(`${interaction.user.id} has binded kamai ID ${interaction.options.getString('kamai')}`);
      embedResponse.setDescription('User has been binded');
    }
    catch (e) {
      logger.error(e);
      embedResponse.setDescription('Failed to bind user');
    }
    await interaction.reply({ embeds: [embedResponse] });
  },
};
