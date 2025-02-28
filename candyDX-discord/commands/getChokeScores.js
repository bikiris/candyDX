const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

const API_URL = process.env.API_URL;
const axios = require('axios');
const logger = require('../logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topchoke')
    .setDescription('Get your top 10 choke scores'),
  async execute(interaction) {
    const embedResponse = new EmbedBuilder().setTitle('Top 10 Choke Scores');
    try {
      const response = await axios.get(API_URL + 'closeScores', {
        params: {
          discordID: interaction.user.id,
        },
      });
      response.data.slice(0, 10).forEach((score, index) => {
        embedResponse.addFields({
          name: '', value: `${index + 1}. ${score.title} - ${score.levelNum} - ${score.percent}% - Next Rank Rating: ${score.nextRating}`,
        });
      });
      logger.info(`${interaction.user.id} has requested top choke scores`);
      await interaction.reply({ embeds: [embedResponse] });
    }
    catch (e) {
      logger.error(e);
      await interaction.reply('Failed to get top choke scores');
    }
  },
};
