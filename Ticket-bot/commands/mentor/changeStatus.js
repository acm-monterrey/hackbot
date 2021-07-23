const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../../models/mentor')

module.exports = {
    name: 'changeStatus',
    description: 'Este comando permite cambiar tu status como mentor.',
    aliases: ['cs'],
    async execute (client, message, cmd, args, Discord) {
        if(!args[0]) {
            try {
                let user = await mentorModel.findOne({ 'username': message.author.tag.toLowerCase() })
                await mentorModel.findOneAndUpdate({ 'username': message.author.tag.toLowerCase()}, {'status': user.status ? false : true}, {returnOriginal: false})
                console.log(user.username + ' ha cambiado su estatus.')
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