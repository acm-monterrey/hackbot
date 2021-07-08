const Discord = require('discord.js');
const { dbuser, dbpass } = require('../config.json')
const { connect } = require('mongoose')

const url = `mongodb+srv://kutse:${dbpass}@cluster0.lidy9.mongodb.net/${dbuser}?retryWrites=true&w=majority`

module.exports = (client) => {
    console.log('HackMTY is online!');

    const ticket_channel = client.guilds.cache.get('810303491339321351').channels.cache.get('840626647362699284');
    const checkIn_channel = client.guilds.cache.get('810303491339321351').channels.cache.get('860747174529990676');
    
    client.user.setActivity('HackMTY 2021', { type: 'STREAMING', url: 'https://www.twitch.tv/hackmty' })

    const ticket_embed = new Discord.MessageEmbed()
        .setThumbnail(client.user.avatarURL())
        .setTitle('Soporte')
        .setDescription('Reacciona al emoji 🎫 para solicitar soporte. \n Este ticket solamente lo verás tú y los moderadores.')
        .setFooter('HackMTY 2021')
        .setColor('#673290')
        .setTimestamp()
    ticket_channel.send(ticket_embed).then((msg) => {
        msg.react('🎫')
    })

    const checkIn_embed = new Discord.MessageEmbed()
        .setThumbnail(client.user.avatarURL())
        .setTitle('Bienvenido a HackMTY 2021!')
        .setDescription('Reacciona a este mensaje con ✅ para confirmar tu check in. \n Reaccionando confirmas que estas de acuerdo con el reglamento del HackMTY y MLH.')
        .addFields(
            { name: 'Codigo de Conducta HackMTY', value: 'https://drive.google.com/file/d/1YL9Ggk-TkUVuyHKCzhH8O2h1pacDg3Q-/view'},
            { name: 'Codigo de Conducta MLH', value: 'https://static.mlh.io/docs/mlh-code-of-conduct.pdf'},
            { name: 'Reglamento del HackMTY', value: '#reglamento'},
        )
        .setFooter('HackMTY 2021')
        .setColor('#673290')
        .setTimestamp()
    checkIn_channel.send(checkIn_embed).then((msg) => {
        msg.react('✅')
    })

    connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(console.log('MongoDB is connected.'))
}