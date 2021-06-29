const Discord = require('discord.js');
const { dbuser, dbpass } = require('../config.json')
const { connect } = require('mongoose')
const pagination = require('discord.js-pagination')

const url = `mongodb+srv://kutse:${dbpass}@cluster0.lidy9.mongodb.net/${dbuser}?retryWrites=true&w=majority`

module.exports = (client) => {
    console.log('HackMTY is online!');

    const ticket_channel = client.guilds.cache.get('810303491339321351').channels.cache.get('840626647362699284');
    const mentor_channel = client.guilds.cache.get('810303491339321351').channels.cache.get('810379900418129950');
    const admin_channel = client.guilds.cache.get('810303491339321351').channels.cache.get('849143330377302046');
    
    const ticket_embed = new Discord.MessageEmbed()
        .setTitle('Soporte')
        .setDescription('Reacciona al emoji 🎫 para solicitar soporte. \n Este ticket solamente lo verás tú y los moderadores.')
        .setFooter('HackMTY 2021')
        .setColor('#10D800 ')
    ticket_channel.send(ticket_embed).then((msg) => {
        msg.react('🎫')
    })

    const admin_embed = new Discord.MessageEmbed()
        .setTitle('Mentor - Admin')
        .setDescription('Reacciona a ✒️ para registrarte como mentor.')
        .setFooter('HackMTY 2021')
        .setColor('#10D800 ')
    admin_channel.send(admin_embed).then((msg) => {
        msg.react('✒️')
    })

    const mentor_embed = new Discord.MessageEmbed()
        .setTitle('Mentor')
        .setDescription('Selecciona ')
        .setFooter('HackMTY 2021')
        .setColor('#10D800 ')
    mentor_channel.send(mentor_embed).then((msg) => {
        msg.react('🎫')
    })

    connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true
    }).then(console.log('MongoDB is connected.'))
}