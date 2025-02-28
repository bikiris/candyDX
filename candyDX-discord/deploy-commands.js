require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const logger = require('./logger.js');
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);

for (const file of commandFolders) {
	const command = require(`${folderPath}/${file}`);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
	else {
		logger.warn(`Invalid command file: ${file}`);
	}
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);
		logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
	}
 catch (e) {
		logger.error(e);
	}
})();