const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

const API_URL = process.env.API_URL;
const axios = require('axios');
const logger = require('../logger.js');

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
    const embedResponse = new EmbedBuilder();
    try {
      const response = await axios.post(API_URL + 'bindUser', {
        discordID: interaction.user.id,
        kamaiID: interaction.options.getString('kamai'),
      });
      if (response.status !== 200) {
        throw new Error('User not found');
      }
      logger.info(`${interaction.user.id} has binded kamai ID ${interaction.options.getString('kamai')}`);
      embedResponse.setTitle(`Binded user ${interaction.options.getString('kamai')}`);
      embedResponse.setDescription('User has been binded');
    }
    catch (e) {
      logger.error(e);
      embedResponse.setTitle(`${interaction.options.getString('kamai')} was not found`);
      embedResponse.setDescription('Failed to bind user');
    }
    await interaction.reply({ embeds: [embedResponse] });
  },
};
