require('dotenv').config()
const { token } = process.env
const Discord = require('discord.js');
const client = new Discord.Client({partial: ['MESSAGE', 'CHANNEL', 'REACTION']});
const fs = require('fs');
const { readdirSync } = require('fs');
const disbut = require('discord-buttons');
disbut(client)

coleccionCheckIn = 'guilds'

prefix = '?'

fs.readdir('./events', (error, files) => {
    if(error) throw error
    files.forEach(file => {
        const event = require(`./events/${file}`)
        const eventName = file.split('.')[0]
        client.on(eventName, event.bind(null, client))
        delete require.cache[require.resolve(`./events/${file}`)]
    })
})

client.commands = new Discord.Collection();

const commandPath = './commands';
readdirSync(commandPath).forEach((direct) => {
    const commandFiles = fs.readdirSync(`${commandPath}/${direct}/`).filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const command = require(`${commandPath}/${direct}/${file}`);

        client.commands.set(command.name, command);
    }
})



client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase()
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(command) {
        command.execute(client, message, cmd, args, Discord)
    }
})


client.login(token);