const { token } = require('./config.json')
const Discord = require('discord.js');
const client = new Discord.Client({partial: ['MESSAGE', 'CHANNEL', 'REACTION']});
const fs = require('fs');
const { readdirSync } = require('fs');

// CONSTANTES GLOBALES
idGuild = '864039145588391936'

idCanalSoporte = '867816162150711306'
idCanalMentoria = '867816372208926730'
idCanalCheckIn = '867815316540882945'

idCategoriaSoporte = '864044281286754304'
idCategoriaMentoria = '860075080594620416'

idRolMesa2021 = '864041126566297610'
idRolSponsor = '707344011618156605'
idRolStaff = '707343935516704819'
idRolJuez = '857339869733584916'
idRolParticipante = '707344268133400696'
idRolMentor = '864041019385184257'

coleccionCheckIn = 'guilds'

prefix = '?'

module.exports = { prefix , idCanalSoporte, idCanalMentoria, idCanalCheckIn, idCategoriaSoporte,
    idCategoriaSoporte, idCategoriaMentoria, idRolMesa2021, idRolSponsor, idRolStaff, idRolJuez, idRolParticipante, idRolMentor,
    coleccionCheckIn, idGuild
};

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