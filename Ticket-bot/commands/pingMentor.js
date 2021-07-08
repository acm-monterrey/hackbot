const { Client, Message, MessageEmbed } = require("discord.js");
const fetchall = require('discord-fetch-all')
const mentorModel = require('../models/mentor')
const fs = require('fs')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'ping',
    description: 'This command let users ping mentors!',
    aliases: ['ping', 'p'],
    async execute (client, message, cmd, args, Discord) {
        const u = message.mentions.users.first()
        const mentordoc = await mentorModel.findOne({ 'username': u.tag.toLowerCase()})
        if(message.channel.id === '810379900418129950' && mentordoc && mentordoc.status == true)  {
            const mentorChannel = await message.guild.channels.create(`mentoria-${message.author.tag}`, {
                type: 'text',
                parent: '860075080594620416',
                permissionOverwrites: [
                    {
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                        id: u
                    },
                    {
                        allow: ['VIEW_CHANNEL'],
                        deny: ['SEND_MESSAGES'],
                        id: message.author.id
                    },
                    {
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                        id: message.guild.id
                    }
                ]
            })

            symbols = ['✔️','❌'];

            let welcome_mentor = new Discord.MessageEmbed()
                .setTitle('¡Bienvenido a la mentoria de HackMTY!')
                .setDescription('El mentor te atenderá a la brevedad. \n 🔒 Cerrar ticket')
                .setFooter('HackMTY 2021')
                .setColor('#673290')
                .setTimestamp()

            let close_mentor = new Discord.MessageEmbed()
                .setTitle('¿Estas seguro?')
                .setDescription('🔒 Cerrar Mentoria \n ❎ Cancelar \n ✅ Confirmar')
                .setFooter('HackMTY 2021')
                .setColor('#10D800')
                .setTimestamp()
    
            let save_mentor = new Discord.MessageEmbed()
                .setTitle('Procesando...')
                .setDescription('📄 Guardar Conversacion \n 🔓 Reabrir Mentoria \n ⛔ Borrar Mentoria')
                .setFooter('HackMTY 2021')
                .setColor('#F60000')
                .setTimestamp()

            let n = new MessageEmbed()
                .setAuthor(client.user.tag, client.user.displayAvatarURL({ dynamic: true}))
                .setDescription(`El mentor **${u}** esta ocupado. Vuelva a solicitar mentoria en unos minutos.`)
                .addField('Eliminacion de Chat', '5 segundos')
                .setColor('#F60000')
                .setTimestamp()

            let e = new MessageEmbed()
                .setAuthor(client.user.tag, client.user.displayAvatarURL({ dynamic: true}))
                .setDescription(`El usuario **${message.author.tag}** quiere tener una mentoria.`)
                .setColor('#673290')
                .setTimestamp()
    
            const reactionMessage = await mentorChannel.send(e)
                reactionMessage.react('✔️')
                reactionMessage.react('❌')

            // ME QUEDE AQUI!!!!!!!!!!!!!!!!!!!!
            const mentorCollector = reactionMessage.createReactionCollector((reaction, user) =>
                reaction.message.guild.member(user).roles.cache.has('810374309150195712') && !user.bot, { dispose: true }
            )

            mentorCollector.on('collect', async (reaction) => {
                if(reaction.emoji.name === '✔️') {
                    mentorChannel.overwritePermissions([
                        {
                          id: message.author.id,
                          allow: ["SEND_MESSAGES"]
                        }
                    ]);
                    reactionMessage.reactions.removeAll().catch(err => {
                        "Fallo al eliminar las reacciones.", err
                    })

                    reactionMessage.edit(welcome_mentor);
                    reactionMessage.react("🔒");

                } else if(reaction.emoji.name === '❌') {
                    reactionMessage.reactions.removeAll().catch(err => {
                        "Fallo al eliminar las reacciones.", err
                    })
                    reactionMessage.edit(n);
                    setTimeout(() => mentorChannel.delete(), 5000);

                } else if(reaction.emoji.name === '🔒') {
                    mentorChannel.overwritePermissions([
                        {
                          id: message.author.id,
                          deny: ["SEND_MESSAGES"]
                        }
                    ]);
                    reactionMessage.edit(close_mentor);
                    reactionMessage.react("❎");
                    reactionMessage.react("✅");

                } else if(reaction.emoji.name === '❎') {
                    mentorChannel.overwritePermissions([
                        {
                          id: message.author.id,
                          allow: ["SEND_MESSAGES"]
                        }
                    ]);
                    reactionMessage.reactions.removeAll().catch(err => {
                        "Fallo al eliminar las reacciones.", err
                    })

                    reactionMessage.edit(welcome_mentor);
                    reactionMessage.react("🔒");

                } else if(reaction.emoji.name === '✅') {
                    let close_mentor_by = new Discord.MessageEmbed()
                        .setDescription(`El mentoreo a sido cerrado.`)
                        .setColor('#F6F600')
                        .setTimestamp()
                    await reaction.message.channel.send(close_mentor_by);
                    reactionMessage.edit(save_mentor)
                    .then(message => {
                        reactionMessage.reactions.removeAll()
                        message.react("📄");
                        message.react("🔓");
                        message.react("⛔");
                    })

                } else if(reaction.emoji.name === '📄') {
                    const msgs = await fetchall.messages(reaction.message.channel, {
                        reverseArray: true
                    })
        
                    const content = msgs.map(m => `${m.author.tag} - ${m.content}`)
        
                    fs.writeFileSync('mentorTranscript.txt', content.join('\n'), error => {
                        if(error) throw error
                    })
        
                    reaction.message.channel.send(new MessageAttachment('mentorTranscript.txt', 'mentorTranscript.txt'))

                } else if(reaction.emoji.name === '🔓') {
                    let open_mentor_by = new Discord.MessageEmbed()
                        .setDescription(`El mentoreo ha sido reabierto.`)
                        .setColor('#10D800')
                        .setTimestamp()
                    await reaction.message.channel.send(open_mentor_by);
                    await reaction.message.channel.updateOverwrite(message.author.id, { SEND_MESSAGES: true});
                    reactionMessage.edit(welcome_mentor)
                    .then(message => {
                        reactionMessage.reactions.removeAll()
                        message.react("🔒");
                    })

                } else if(reaction.emoji.name === '⛔') {
                    mentorCollector.stop()
                    reaction.message.channel.delete()
                }
            })

        } else {
            message.channel.send("**No se pudo realizar la mentoria.**\n ``` Posibles Razones \n1. El usuario mencionado no es un mentor. \n2. Estas en el canal incorrecto. \n3. El mentor no esta disponible.```")
        }

    },

};