const { Client, Message, MessageEmbed } = require("discord.js");
const fetchall = require('discord-fetch-all')
const mentorModel = require('../../models/mentor')
const fs = require('fs')
const { MessageAttachment } = require('discord.js');
const { idRolMentor, idCategoriaMentoria } = process.env

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
                const mentorChannel = await message.guild.channels.create(`mentoria-${message.author.tag}`, {
                    type: 'text',
                    parent: idCategoriaMentoria,
                    permissionOverwrites: [
                        {
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                            id: mentor.id
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

                
                const symbols = {
                    accept: '☑️',
                    cancel: '❌',
                    approve:'✅',
                    deny:'❎',
                    lock: "🔒",
                    stop: "⛔",
                    save: "📄",
                    unlock: "🔓",
                };

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
                    reactionMessage.react(symbols.accept)
                    reactionMessage.react(symbols.cancel)

                // ME QUEDE AQUI!!!!!!!!!!!!!!!!!!!!
                const mentorCollector = reactionMessage.createReactionCollector((reaction, user) =>
                    reaction.message.guild.member(user).roles.cache.has(idRolMentor) && !user.bot, { dispose: true }
                )

                mentorCollector.on('collect', async (reaction) => {
                    if(reaction.emoji.name === symbols.accept) {
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
                        reactionMessage.react(symbols.lock);

                    } else if(reaction.emoji.name === symbols.cancel) {
                        reactionMessage.reactions.removeAll().catch(err => {
                            "Fallo al eliminar las reacciones.", err
                        })
                        reactionMessage.edit(n);
                        setTimeout(() => mentorChannel.delete(), 5000);

                    } else if(reaction.emoji.name === symbols.lock) {
                        mentorChannel.overwritePermissions([
                            {
                            id: message.author.id,
                            deny: ["SEND_MESSAGES"]
                            }
                        ]);
                        reactionMessage.edit(close_mentor);
                        reactionMessage.react(symbols.deny);
                        reactionMessage.react(symbols.approve);

                    } else if(reaction.emoji.name === symbols.deny) {
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
                        reactionMessage.react(symbols.lock);

                    } else if(reaction.emoji.name === symbols.approve) {
                        let close_mentor_by = new Discord.MessageEmbed()
                            .setDescription(`El mentoreo a sido cerrado.`)
                            .setColor('#F6F600')
                            .setTimestamp()
                        await reaction.message.channel.send(close_mentor_by);
                        reactionMessage.edit(save_mentor)
                        .then(message => {
                            reactionMessage.reactions.removeAll()
                            message.react(symbols.save);
                            message.react(symbols.unlock);
                            message.react(symbols.stop);
                        })

                    } else if(reaction.emoji.name === symbols.save) {
                        const msgs = await fetchall.messages(reaction.message.channel, {
                            reverseArray: true
                        })
            
                        const content = msgs.map(m => `${m.author.tag} - ${m.content}`)
            
                        fs.writeFileSync('mentorTranscript.txt', content.join('\n'), error => {
                            if(error) throw error
                        })
            
                        reaction.message.channel.send(new MessageAttachment('mentorTranscript.txt', 'mentorTranscript.txt'))

                    } else if(reaction.emoji.name === symbols.unlock) {
                        let open_mentor_by = new Discord.MessageEmbed()
                            .setDescription(`El mentoreo ha sido reabierto.`)
                            .setColor('#10D800')
                            .setTimestamp()
                        await reaction.message.channel.send(open_mentor_by);
                        await reaction.message.channel.updateOverwrite(message.author.id, { SEND_MESSAGES: true});
                        reactionMessage.edit(welcome_mentor)
                        .then(message => {
                            reactionMessage.reactions.removeAll()
                            message.react(symbols.lock);
                        })

                    } else if(reaction.emoji.name === symbols.stop) {
                        mentorCollector.stop()
                        reaction.message.channel.delete()
                    }
                })

            } else {
                message.channel.send("**No se pudo realizar la mentoria.**\n ``` Posibles Razones \n1. El usuario mencionado no es un mentor. \n2. El mentor no esta disponible.```")
            }
        }
        catch(err) {
            console.log('err :>> ', err);
            message.channel.send("Hubo un error, intenta de nuevo más tarde o contacta soporte.")
        }
    },

};