const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../../models/mentor')

module.exports = {
    name: 'mentorlist',
    description: 'Permite ver la lista de mentores.',
    aliases: ['ml'],
    example: "?mentorlist",
    async execute (client, message, cmd, args, Discord) {
        const mentors = await mentorModel.find()
        let counter = 1;
        const list = [];

        for(var i = 0; i < mentors.length; i += 4) {
            const items = mentors.slice(i, i + 4);
            list.push(items);
        }

        const symbols = ["◀️", "▶️"];
        let page = 0;
        const embed = new MessageEmbed()
            .setTitle('Lista de Mentores!')
            .setDescription(
                '**Encuentra a tu mentor. Tambien, si esta disponible 🟩 o no 🟥.**'
            )
            .setColor('#673290')
            embed.setFooter(`Page ${page + 1} of ${list.length}`)
            .setTimestamp()

        for(let mentor of list[page]) {
            embed.addField(
                `―――――――――――――――――――`, `${mentor.username} | ${mentor.name} | ${mentor.skills} | ${mentor.status ? '🟩' : '🟥'}`, false
            )
            counter++;
        }

        const msg = await message.channel.send(embed);
        symbols.forEach(symbol => msg.react(symbol));
        let doing = true;

        while(doing) {
            let r;
            const filter = (r, u) => symbols.includes(r.emoji.name) && u.id === message.author.id;
            try {
                r = await msg.awaitReactions(filter, { max: 1, time: 20000, errors: ["time"]})

            } catch {
                let newM = new Discord.MessageEmbed()
                        .setTitle('Lista de Mentores!')
                        .setDescription(
                            'Se acabo el tiempo, vuelve a escribir el comando.'
                        )
                        .setColor('#c32929')
                        .setTimestamp()
                return msg.edit(newM)
            }
            const u = message.author;
            r = r.first();

            if(r.emoji.name == symbols[1]) {
                if(!list[page + 1]) {
                    msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => {})
                } else {
                    page++;
                    msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => {})
                    let newM = new Discord.MessageEmbed()
                        .setTitle('Lista de Mentores!')
                        .setDescription(
                            'Conoce el usuario y habilidades del mentor. Asi como si esta disponible 🟩 o no 🟥.'
                        )
                        .setColor('#673290')
                        .setFooter(`Page ${page + 1} of ${list.length}`)
                        .setTimestamp()

                    for(let mentor of list[page]) {
                        newM.addField(
                            `―――――――――――――――――――`, `${mentor.username} | ${mentor.name} | ${mentor.skills} | ${mentor.status ? '🟩' : '🟥'}`, false
                        )
                        counter++;
                    }
                    msg.edit(newM);
                }
            } else if(r.emoji.name == symbols[0]) {
                if(!list[page - 1]) {
                    msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => {})
                } else {
                    page--;
                    msg.reactions.resolve(r.emoji.name).users.remove(u.id).catch(err => {})
                    let newM = new Discord.MessageEmbed()
                        .setTitle('Lista de Mentores!')
                        .setDescription(
                            'Conoce el usuario y habilidades del mentor. Asi como si esta disponible 🟩 o no 🟥.'
                        )
                        .setColor('#673290')
                        .setFooter(`Page ${page + 1} of ${list.length}`)
                        .setTimestamp()

                    for(let mentor of list[page]) {
                        newM.addField(
                            `―――――――――――――――――――`, `${mentor.username} | ${mentor.name} | ${mentor.skills} | ${mentor.status ? '🟩' : '🟥'}`, false
                        )
                        counter++;
                    }
                    msg.edit(newM);
                }
            }
        }
    },

};