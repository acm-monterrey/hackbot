const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../../models/mentor')

module.exports = {
    name: 'changestatus',
    description: 'Este comando permite cambiar tu status como mentor.',
    aliases: ['cs','changeStatus'],
    example: "?cs",
    async execute (client, message, cmd, args, Discord) {
        if(!args[0]) {
            try {
                let user = await mentorModel.findOne({ 'username': message.author.tag })
                await mentorModel.findOneAndUpdate({ 'username': message.author.tag}, {'status': user.status ? false : true}, {returnOriginal: false})
                console.log(`Bot: Mentoria | Estatus: Correcto | ${user.username} : Acaba de cambiar su estatus de mentor a ${user.status}.`)
                if(user.status) {
                    message.react("🟥")
                } else {
                    message.react("🟩")
                }
            } catch {
                message.channel.send("No eres mentor.")
            }
        }
    },

};