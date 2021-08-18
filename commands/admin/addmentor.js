const { Client, Message, MessageEmbed } = require("discord.js");
const mentorModel = require('../../models/mentor')

module.exports = {
    name: 'addmentor',
    description: 'Añadir un mentor a la lista de mentores.',
    aliases: ['am','addm'],
    async execute (client, message, cmd, args, Discord) {
        const u = message.mentions.users.first()
        if(!args[0] || !u) return message.reply('Taggea a la persona.')
        console.log(`${message.author} a iniciado un proceso de agregar mentor.`);

        message.author.send("**REGISTRO MENTORES**\n **Introduce los datos a continuacion para completar el registro.**")
        const questions = [
            "```Nombre```",
            "```Habilidades, separadas por comas (ej. AWS,Desarrollo web,Python,React,Javascript)```",
            "```Estatus (ej. true o false)```",
            "```Descripcion (ej. Estudiante de ITC)```",
        ]

        let res = [];
        let resHabilidades = [];
        let collectCounter = 0;
        let endCounter = 0;

        const filter = (m) => m.author.id === message.author.id;

        const appStart = await message.author.send(questions[collectCounter++]);
        const channel = appStart.channel;

        const collector = channel.createMessageCollector(filter);

        collector.on("collect", async (msg) => {
            res.push(msg.content.toLowerCase());
            if(collectCounter < questions.length) {
                channel.send(questions[collectCounter++]);
            } else {
                channel.send("La aplicacion ha sido enviada exitosamente!")
                collector.stop("completo");
            }
        });

        collector.on('end', async (collected, reason) => {
            if(reason === 'completo') {
                let index = 1;
                const mappedResponses = collected.map((msg) => {
                    return `${index++} ${questions[endCounter++]}\n-> ${msg.content.toLowerCase()}`;
                }).join("\n\n");
    
                channel.send(
                    new MessageEmbed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true}))
                        .setTitle('Nuevo Mentor!')
                        .setDescription(mappedResponses)
                        .setColor('RANDOM')
                        .setTimestamp()
                );

                resHabilidades = res[1].split(',');

                const addMentorDoc = new mentorModel({
                    discordId: u.id,
                    name: res[0],
                    username: u.tag,
                    skills: resHabilidades,
                    status: res[2],
                    description: res[3],
                })

                await addMentorDoc.save()

                console.log(`${u.tag} ahora esta registrado como mentor.`);
            }

        })


    },

};