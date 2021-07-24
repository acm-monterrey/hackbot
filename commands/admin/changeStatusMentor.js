const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../../models/mentor')

module.exports = {
    name: 'changeStatusMentor',
    description: 'Permite cambiar el status de cualquier de los mentores!',
    example: "?changeStatusMentor @kutse#0001",
    aliases: ['csm'],
    async execute (client, message, cmd, args, Discord) {
        if (!args[0]) return message.reply('Porfavor, especifica un usuario.');
        if (args[1]) return message.reply('Demasiados argumentos. Formato: ?cs "username"');
        console.log('args :>> ', args);
        try {
            let user = await mentorModel.findOne({ 'username': args[0].toLowerCase()})
            let doc = await mentorModel.findOneAndUpdate({ 'username': args[0].toLowerCase()}, {'status': user.status ? false : true}, {returnOriginal: false})
            console.log('doc :>> ', doc);
            console.log('user :>> ', user);
            console.log(user.username + ' has cambiado el estatus de ' + args[0].toLowerCase() + '.');
            if(user.status) {
                message.react("🟥")
            } else {
                message.react("🟩")
            }
        } catch (error){
            console.log('error :>> ', error);
            message.channel.send("El mentor no existe.")
        }
    },

};