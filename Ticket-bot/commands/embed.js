const Discord = require('discord.js');

module.exports = {
    name: 'embed',
    description: "this is a embed command",
    execute(message, args, Discord){
        const embed = new Discord.MessageEmbed()
            .setTitle('Title')
            .setColor('#0099ff')
            .setDescription('Message with a description')
        message.channel.send(embed);
    }
}