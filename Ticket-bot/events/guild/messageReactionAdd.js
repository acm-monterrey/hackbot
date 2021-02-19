module.exports = async (client, Discord) => {
    const registerEvent = client => {
        if(registered) {
            return;
        }
        registered = true;

        client.on('messageReactionAdd', async (reaction, user) => {
        
            if(user.bot) {
                return;
            }
        
            console.log('Handling Reaction')
            const {message} = reaction;
            const usuarioID = user.id;
            const ch = message.guild.channels.cache.find(ch => ch.name === usuarioID);
            if(message.author.id === botID){
                if(reaction.emoji.name === emoji){
                    if(ch){
                        reaction.users.remove(user.id);
                        return user.send(`You already have a ticket open ${user.username}. Your ticket is in channel ${message.guild.channels.cache.find(c => c.name === usuarioID)}`);
                    } else {
                        reaction.users.remove(user.id);
                        message.guild.channels.create(usuarioID, {
                            type: "text",
                            parent: categoria,
                            permissionOverwrites: [
                                {
                                    id: user.id,
                                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                                },
                                {
                                    id: message.guild.roles.everyone,
                                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                                },
                            ],
                        }).then(chanel => {
                            let privEmbed = new Discord.MessageEmbed()
                                .setTitle('Ticket System')
                                .setDescription('To close the ticket react with 🔒')
                                .setFooter('Ticket Tool made by HackMTY')
                            chanel.send(privEmbed).then((msg) => {
                                await msg.react(emoji2);
                            }) 
                        })
                    }
                } else if(reaction.emoji.name === emoji2) {
                    reaction.remove();
                    let privEmbed2 = new Discord.MessageEmbed()
                        .setTitle('Ticket System')
                        .setDescription('To cancel ticket erase, react with ❎\nTo confirm ticket erase, react with ✅')
                        .setFooter('Ticket Tool made by HackMTY')
                    message.edit(privEmbed2).then((msg) => {
                        msg.react(emoji3);
                        msg.react(emoji4);
                    }) 
                    return;
                }
            }
        })
    }
    
    const canal = '811517697988755486';
    const categoria = '811503336766832650';
    const botID = '811452740819615745';
    const emoji = '🎫';
    const emoji2 = '🔒';
    const emoji3 = '❎';
    const emoji4 = '✅';
    let registered = false;
    const canalTexto = client.channels.cache.get(canal);
    registerEvent(client);


}