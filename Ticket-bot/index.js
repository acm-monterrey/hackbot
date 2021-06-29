const { token } = require('./config.json')
const Discord = require('discord.js');
const client = new Discord.Client({partial: ['MESSAGE', 'CHANNEL', 'REACTION']});
const fs = require('fs');

client.prefix = '?'

fs.readdir('./events', (error, files) => {
    if(error) throw error
    files.forEach(file => {
        const event = require(`./events/${file}`)
        const eventName = file.split('.')[0]
        client.on(eventName, event.bind(null, client))
        delete require.cache[require.resolve(`./events/${file}`)]
    })
})

// const dbOptions = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: true
// }

// client.commands = new Discord.Collection();

// const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('js'));
// for(const file of commandFiles) {
//     const command = require(`./commands/${file}`);

//     client.commands.set(command.name, command);
// }

// client.on('ready', async (message) => {
//     console.log('HackMTY is online!');

//     await db.connect('mongodb+srv://kutse:4L3j4ndr0!@cluster0.lidy9.mongodb.net/kutse?retryWrites=true&w=majority', dbOptions)
//     .then(console.log('Active'))

//     const channel = client.guilds.cache.get('810303491339321351').channels.cache.get('840626647362699284');

//     const embed = new Discord.MessageEmbed()
//         .setTitle('Soporte')
//         .setDescription('Reacciona al emoji 🎫 para solicitar soporte. \n Este ticket solamente lo verás tú y los moderadores.')
//         .setFooter('HackMTY 2021')
//         .setColor('#10D800 ')
//     await channel.send(embed).then((msg) => {
//         msg.react('🎫')
//     }) 
// });

// client.on('messageReactionAdd', async (reaction, user) => {
//     if(reaction.message.partial) await reaction.message.fetch();
//     if(reaction.partial) await reaction.fetch();
//     if(user.bot) return;
//     if(!reaction.message.guild) return;
//         if(reaction.message.channel.id == "840626647362699284") {
//             if(reaction.emoji.name === '🎫') {
//                 client.commands.get('ticket').execute(reaction.message, user);
//             }
//         }
//     reaction.users.remove(user);
// })


client.login(token);