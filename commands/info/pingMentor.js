const { Client, Message, MessageEmbed } = require("discord.js");
const fetchall = require('discord-fetch-all')
const mentorModel = require('../../models/mentor')
const fs = require('fs')
const { MessageAttachment } = require('discord.js');
const { idRolMentor } = process.env

module.exports = {
    name: 'ping',
    description: 'Permite notificar al mentor de tu preferencia que solicitas una mentoria.',
    aliases: ['ping', 'p'],
    example: "?ping @kutse#0001",
    async execute (client, message, cmd, args, Discord) {
        try{
            const u = message.mentions.users.first()
            const firstArg = args[0];
            let mentor;
            let mentordoc;
            if(u) {
                mentor = u;
                mentordoc = await mentorModel.findOne({ 'username': mentor.tag});
            } else {
                mentordoc = await mentorModel.findOne({ 'username': firstArg});
                if(!mentordoc) {
                    return message.channel.send("Ese usuario no existe o no es mentor");
                }
                
                mentor = await client.users.fetch(mentordoc.discordId)
            } 
            if(mentordoc && mentordoc.status == true)  {
                 
                const symbols = {
                    accept:'✅',
                    cancel:'❌'
                }

                const voiceChannel = message.member.voice

                if(!voiceChannel.channel) {
                    message.react(symbols.cancel)
                    return message.reply('No estas conectado a un canal de voz.')
                }


                message.react(symbols.accept)

                let privateMessage = new MessageEmbed()
                    .setAuthor(client.user.tag, client.user.displayAvatarURL({ dynamic: true}))
                    .setDescription(`El usuario **${message.author.tag}** quiere tener una mentoria. 
                    \nEl canal de voz de la mentoria es <#${voiceChannel.channelID}>`)
        

                const reactionMessage = await mentor.send(privateMessage)
                    //reactionMessage.react(symbols.accept)

                console.log()

            } else {
                message.channel.send("**No se pudo realizar la mentoria.**\n ``` Posibles Razones \n1. El usuario mencionado no es un mentor. \n2. El mentor no esta disponible.```")
            }
        }
        catch(err) {
            console.log('err :>> ', err);
        }
    },

};