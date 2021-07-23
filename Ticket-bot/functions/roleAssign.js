const Discord = require('discord.js');
const fetchall = require('discord-fetch-all')
const fs = require('fs')
const { MessageAttachment, Message } = require('discord.js');
const { idRolMentor } = require('..');
const mongoose = require('mongoose')
const checkIn = require('../models/checkIn')


module.exports = async (reaction, user, checkModel, client) => {

    const checkUser = checkIn;

    let correct_assign = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
        .setTitle(`Bienvenid@ ${user.tag} al Bootcamp!`)
        .setThumbnail(client.user.avatarURL({ dynamic:true }))
        //.setDescription('Nos da gusto que puedas formar parte de esta nueva experiencia! \n A continuación te mencionaremos algunas de las cosas que acabas de desbloquear:')
        .setFooter('HackMTY 2021')
        .setColor('#673290')
        .setTimestamp()

    try {
        
        const data = await checkUser.findOne({ "profile.discordUsername": { $regex : new RegExp(user.tag, "i")} });
        if(data) {
            const table = data.status.tableNumber;
            if(table != "Not assigned") {
                const equipo = 'equipo-' + table;
                const equipoRole = reaction.message.guild.roles.cache.find(t => t.name === equipo);
                await reaction.message.guild.members.cache.get(user.id).roles.add(equipoRole.id)
                correct_assign.addField(`- Haz sido asignado al equipo ${table}. \n- Canal de voz y texto del equipo ${table}.`, '\u200B')
                user.send(correct_assign)
            } else {
                user.send("```No ha confirmado todo tu equipo. Porfavor, revisa la pagina.```")
                await reaction.users.remove(user.id)
            }
        } else {
            user.send("```No estas registrado en la base de datos. Utiliza el canal de soporte para pedir apoyo.```")
            await reaction.users.remove(user.id)
        }

    } catch(err) {
        console.error(err)
    }

    //user.roles.add(idRolMentor)
    



}