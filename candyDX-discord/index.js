require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const logger = require('./logger.js');

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
	logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});


const chokeCommand = require('./commands/getChokeScores.js');
const bindCommand = require('./commands/bindID.js');

client.commands = new Collection();
client.commands.set(chokeCommand.data.name, chokeCommand);
client.commands.set(bindCommand.data.name, bindCommand);

client.on(Events.InteractionCreate, async interaction => {
  try {
		await interaction.client.commands.get(interaction.commandName).execute(interaction);
	}
  catch (error) {
		logger.error(error);
	}
});


client.login(DISCORD_TOKEN);