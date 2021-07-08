const { token } = require('./config.json')
const Discord = require('discord.js');
const client = new Discord.Client({partial: ['MESSAGE', 'CHANNEL', 'REACTION']});
const fs = require('fs');

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

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase()

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(command) {
        command.execute(client, message, cmd, args, Discord)
    }
})

module.exports = { prefix: prefix}


client.login(token);