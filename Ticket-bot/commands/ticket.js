const Discord = require('discord.js');

module.exports = {
    name: 'ticket',
    aliases: [],
    permissions: [],
    description: 'open a ticket!',
    async execute(message, user, args, cmd, client, discord){
        const c = message.guild.channels.cache.find(ch => ch.name ===  `ticket-${user.username.toLowerCase() + user.discriminator}`);
        if(c) return;

        // Crea el ticket
        const channel = await message.guild.channels.create(`ticket-${user.username.toLowerCase() + user.discriminator}`);
        channel.setParent('811503336766832650');

        // Crea los embeds que utilizaremos
        let create_ticket = new Discord.MessageEmbed()
            .setTitle('¡Bienvenido al soporte de HackMTY!')
            .setDescription('Alguien te atenderá a la brevedad. \n 🔒 Cerrar ticket')
            .setFooter('HackMTY 2021')
            .setColor('#10D800')

        let close_ticket = new Discord.MessageEmbed()
            .setTitle('¿Estas seguro?')
            .setDescription('🔒 Cerrar ticket \n ❎ Cancelar \n ✅ Confirmar')
            .setFooter('HackMTY 2021')
            .setColor('#10D800')
        
        let save_ticket = new Discord.MessageEmbed()
            .setTitle('Procesando...')
            .setDescription('📄 Guardar Conversacion \n 🔓 Reabrir ticket \n ⛔ Borrar Ticket')
            .setFooter('HackMTY 2021')
            .setColor('#F60000')
            

        // Permisos iniciales
        await channel.updateOverwrite(message.guild.id, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
        })

        await channel.updateOverwrite(user.id, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
        })

        // Crea el embed principal del ticket
        const reactionMessage = await channel.send(create_ticket);
        try {
            await reactionMessage.react("🔒");
        } catch (err) {
            channel.send("Error sending emojis!");
            throw err;
        }

        const collector = reactionMessage.createReactionCollector((reaction, user) =>
            message.guild.members.cache.find((member) => member.id === user.id).hasPermission('ADMINISTRATOR') && !user.bot,
            { dispose: true }
        )

        collector.on('collect', async (reaction) => {
            switch (reaction.emoji.name) {
                case "🔒":
                    await channel.updateOverwrite(user.id, { SEND_MESSAGES: false});
                    reactionMessage.edit(close_ticket)
                    .then(message => {
                        message.react("❎");
                        message.react("✅");
                    })
                    break;

                case "❎":
                    reactionMessage.edit(create_ticket)
                    .then(message => {
                        reactionMessage.reactions.removeAll()
                        message.react("🔒");
                    })
                    break;

                case "✅":
                    let close_ticket_by = new Discord.MessageEmbed()
                        .setDescription(`Ticket cerrado por ${user.tag}`)
                        .setColor('#F6F600')
                    await channel.send(close_ticket_by);
                    reactionMessage.edit(save_ticket)
                    .then(message => {
                        reactionMessage.reactions.removeAll()
                        message.react("📄");
                        message.react("🔓");
                        message.react("⛔");
                    })
                    break; 

                case "🔓":
                    let open_ticket_by = new Discord.MessageEmbed()
                        .setDescription(`Ticket reabierto por ${user.tag}`)
                        .setColor('#10D800')
                    await channel.send(open_ticket_by);
                    await channel.updateOverwrite(user.id, { SEND_MESSAGES: true});
                    reactionMessage.edit(create_ticket)
                    .then(message => {
                        reactionMessage.reactions.removeAll()
                        message.react("🔒");
                    })
                    break; 
                    
                case "⛔":
                    channel.send('Eliminando canal...');
                    setTimeout(() => channel.delete(), 3000);
                    break; 
            }
        })
    },

    // transcript(message) {
    //     let messageCollection = new Discord.Collection;
    //     let channelMessages = await message.channel.fetchMessages({
    //         limit: 100
    //     }).catch(err => console.log())
    // }
}