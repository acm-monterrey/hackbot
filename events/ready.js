const Discord = require('discord.js');
const { dbuser, dbpass } = process.env
const { connect } = require('mongoose');
const { idGuild, idCanalSoporte, idCanalCheckIn } = process.env


const url = `mongodb+srv://kutse:${dbpass}@cluster0.zfvd4.mongodb.net/${dbuser}?retryWrites=true&w=majority`

module.exports = (client) => {
    console.log('HackMTY is online!');

    const ticket_channel = client.guilds.cache.get(idGuild).channels.cache.get(idCanalSoporte);
    const checkIn_channel = client.guilds.cache.get(idGuild).channels.cache.get(idCanalCheckIn);
    
    client.user.setActivity('HackMTY 2021', { type: 'STREAMING', url: 'https://www.twitch.tv/hackmty' })

    const ticket_embed = new Discord.MessageEmbed()
        //.setThumbnail(client.user.avatarURL())
        .setTitle('Soporte')
        .setDescription('Reacciona al emoji 🎫 para solicitar soporte. \n Este ticket solamente lo verás tú y los moderadores.')
        .setFooter('HackMTY 2021')
        .setColor('#673290')
        .setTimestamp()
    ticket_channel.send(ticket_embed).then((msg) => {
        msg.react('🎫')
    })

    const checkIn_embed = new Discord.MessageEmbed()
        .setThumbnail('https://cdn.discordapp.com/attachments/867815316540882945/868316755691446322/Demo-11.png')
        .setTitle('Bienvenido al Bootcamp!')
        .setDescription('Reacciona a este mensaje con ✅ para confirmar tu check in. \n Reaccionando confirmas que estas de acuerdo con el reglamento de Global Challenge'/* + 'l HackMTY y MLH.'*/)
        /*.addFields(
            { name: 'Codigo de Conducta HackMTY', value: 'https://drive.google.com/file/d/1YL9Ggk-TkUVuyHKCzhH8O2h1pacDg3Q-/view'},
            { name: 'Codigo de Conducta MLH', value: 'https://static.mlh.io/docs/mlh-code-of-conduct.pdf'},
            { name: 'Reglamento del HackMTY', value: '#reglamento'},
        )*/
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