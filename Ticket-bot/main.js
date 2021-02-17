const Discord = require('discord.js')
const client = new Discord.Client();
const prefix = '.';
const fs = require('fs');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

// client.on('message', (message) => {
//     if(!message.content.startsWith(prefix) || message.author.bot) {
//         return;
//     }
//     const args = message.content.slice(prefix.length).split(/ +/);
//     const command = args.shift().toLowerCase();

//     if(command === 'embed'){
//         client.commands.get('embed').execute(message, args, Discord);
//     }
// })

client.login('ODExNDUyNzQwODE5NjE1NzQ1.YCyaQQ.Lon7k_j0PgdDaAEFOTbgqCRD9K4');