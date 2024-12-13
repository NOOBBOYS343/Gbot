const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { GiveawaysManager } = require('discord-giveaways');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Message listener
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client, config.prefix);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

// Giveaway manager setup
client.giveawaysManager = new GiveawaysManager(client, {
    storage: './giveaways.json',
    updateCountdownEvery: 10000,
    endedGiveawaysLifetime: 604800000,
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        reaction: '🎉',
    },
});

// Log in the bot
client.login(config.token);