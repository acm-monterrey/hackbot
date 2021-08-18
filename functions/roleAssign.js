const Discord = require('discord.js');
const fetchall = require('discord-fetch-all')
const fs = require('fs')
const { MessageAttachment, Message } = require('discord.js');
const { idRolMentor, idRolParticipante } = process.env
const mongoose = require('mongoose')
const checkIn = require('../models/checkIn')


module.exports = async (reaction, user, checkModel, client) => {

    const checkUser = checkIn;

    let correct_assign = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
        .setTitle(`Bienvenid@ ${user.tag} a HackMTY!`)
        .setThumbnail(client.user.avatarURL({ dynamic:true }))
        .setDescription('Nos da gusto que puedas formar parte de esta nueva experiencia! \n A continuación te mencionaremos algunas de las cosas que acabas de desbloquear:')
        .setFooter('HackMTY 2021')
        .setColor('#673290')
        .setTimestamp()

    try {
        
        const data = await checkUser.findOne({ "profile.discordUsername": { $regex : new RegExp(user.tag, "i")} });
        if(data) {
            const table = data.status.tableNumber;
            if(table != "Not assigned") {
                const equipo = 'equipo ' + table;
                const equipoRole = await reaction.message.guild.roles.cache.find(t => t.name.toLowerCase() === equipo.toLowerCase());
                
                await reaction.message.guild.members.cache.get(user.id).roles.add(equipoRole.id)
                await reaction.message.guild.members.cache.get(user.id).roles.add(idRolParticipante)
                console.log(`Bot: Check-in | Estatus: Incompleto | ${user.tag} : Se ha asignado el rol -> equipo ${table}.`)
                correct_assign.addField(`- Haz sido asignado al equipo ${table}. \n- Canal de voz y texto del equipo ${table}.`, '\u200B')
                
                let nickname = `${data.profile.name} - ${data.teamCode}`
                if(!reaction.message.member.hasPermission("MANAGE_NICKNAMES")) return console.log(`Bot: Check-in | Estatus: Incompleto | ${user.tag} : El bot no tiene suficientes permisos para camibar el apodo.`);
                if(nickname.length > 32) {
                    console.log(`Bot: Check-in | Estatus: Procesando | ${user.tag} : El apodo del usuario es demasiado largo, acortando apodo.`);
                    nickname = nickname.substring(0, 32);
                }
                
                const member = reaction.message.guild.members.cache.get(user.id)
                member.setNickname(nickname)
                
                console.log(`Bot: Check-in | Estatus: Correcto | ${user.tag} : Se ha asignado el apodo -> ${nickname}`)
                user.send(correct_assign)
            } else {
                user.send("```No ha confirmado todo tu equipo. Porfavor, revisa la pagina.```")
                console.log(`Bot: Check-in | Estatus: Incompleto | ${user.tag} : Acaba de realizar check-in, pero todavia no tiene una mesa asignada.`)
                await reaction.users.remove(user.id)
            }
        } else {
            user.send("```No estas registrado en la base de datos. Utiliza el canal de soporte para pedir apoyo.```")
            await reaction.users.remove(user.id)
            console.log(`Bot: Check-in | Estatus: Incompleto | ${user.tag} : Acaba de realizar check-in, pero no esta registrado en la base de datos.`)
        }

    } catch(err) {
        console.error(err)
    }

    



}