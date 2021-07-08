const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../models/mentor')

module.exports = {
    name: 'changeStatus',
    description: 'this is a add mentor command!',
    aliases: ['csm','cs'],
    async execute (client, message, cmd, args, Discord) {
        if (!args[0]) return message.reply('Porfavor, especifica un usuario.');
        if (!args[1]) return message.reply('Porfavor, incluye el estatus.');
        if (args[2]) return message.reply('Demasiados argumentos. Formato: ?cs "username" "true or false"');
        try {
            let doc = await mentorModel.findOneAndUpdate({ 'username': args[0].toLowerCase()}, {'status': args[1].toLowerCase()}, {returnOriginal: false})
        } catch {
            message.channel.send("El mentor no existe.")
        }
    },

};