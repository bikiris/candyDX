require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1026535098478252062';
const GUILD_ID = '675556524055330837';


const { REST, Routes } = require('discord.js');


const commands = [];
commands.push(require('./commands/getChokeScores.js').data.toJSON());
commands.push(require('./commands/bindID.js').data.toJSON());


const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
 catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();