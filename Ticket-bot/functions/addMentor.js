const Discord = require('discord.js');

module.exports = async (message, guild, user, mentorModel) => {
    
    if(user.bot) return;

    const filter = (m) => m.author.id === message.author.id;

    var msg = user.send("```Has iniciado el proceso de registro de mentor.``` **Escribe el usuario del mentor (Incluye el hashtag y los cuatro numeros):**")
    
    const collector = new MessageCollector(msg.channel, filter, {
        time: 10000,
    });

    collector.on('collect', (msgs) => {
        console.log(msgs.content);
    })

}