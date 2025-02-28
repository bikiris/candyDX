const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

const API_URL = process.env.API_URL;
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topchoke')
    .setDescription('Get the top choke scores for a user'),
  async execute(interaction) {
    const embedResponse = new EmbedBuilder().setTitle('Top Choke Scores');
    try {
      console.log(interaction.user.id);
      const response = await axios.get(API_URL + 'closeScores', {
        params: {
          discordID: interaction.user.id,
        },
      });
      console.log(response.data);
      response.data.slice(0, 10).forEach((score, index) => {
        embedResponse.addFields({
          name: `${index}`,
          value: `${score.title}, ${score.level}, ${score.percent}, ${score.nextRank}, ${score.nextRating}`,
        });
      });
      await interaction.reply({ embeds: [embedResponse] });
    }
    catch (e) {
      console.log(e);
      await interaction.reply('Failed to get top choke scores');
    }
    // await interaction.reply(`${topChoke.title} - ${topChoke.level} - ${topChoke.percent} - ${topChoke.nextRating}`);
  },
};
