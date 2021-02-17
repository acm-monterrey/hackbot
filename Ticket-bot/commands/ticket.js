const {Discord, client} = require('discord.js');

module.exports = {
    name: 'ticket',
    description: "Ticket system for the HackMTY",
    execute(Discord, message, args, client){
        const canal = '811517697988755486';
        const cat = '811503336766832650';
        const ch = message.guild.channels.cache.find(ch => ch.name === message.author.id);
        if(message.channel.id === canal) {
            if(ch){
                return message.channel.send(`You already have a ticket open ${message.author}.`);
            } else {
                message.guild.channels.create(`${message.author.id}`).then( chanel => {
                    chanel.setParent(cat);
                    chanel.updateOverwrite(message.guild.roles.everyone, {
                        SEND_MESSAGES: false,
                        VIEW_CHANNEL: false
                    })
                    chanel.updateOverwrite(message.guild.me, {
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true
                    })
                    message.channel.send("I have created the ticket for you.");
                    chanel.send("Support will be here shortly.").then( m => {
                        m.pin()
                    })
                })
            }
        } else {
            message.channel.send(`You are in the incorrect channel. ${message.author} you must go to the channel ${message.guild.channels.cache.get(canal)}`)
        }
        
    }
}