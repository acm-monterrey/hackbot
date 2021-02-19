const canal = '811517697988755486';
const categoria = '811503336766832650';
const emoji = '🎫';
let registered = false;

const registerEvent = client => {
    if(registered) {
        return;
    }
    registered = true;

    console.log('Registering Events')

    client.on('messageReactionAdd', (reaction, user) => {
    
        if(user.bot) {
            return;
        }
    
        console.log('Handling Reaction')
        const {message} = reaction;
        const ch = message.guild.channels.cache.find(ch => ch.name === message.author.id);
        if(message.channel.id === canal){
            if(reaction.emoji.name === emoji){
                if(ch){
                    return message.author.send(`You already have a ticket open ${message.author}. Your ticket is in channel ${message.guild.channels.cache.find(c => c.name === message.author.id)}`);
                } else {
                    message.guild.channels.create(`${message.author.id}`).then( chanel => {
                        chanel.setParent(categoria);
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
            }
        }
    })
}

module.exports = {
    name: 'ticket',
    description: "Ticket system for the HackMTY",
    async execute(client, message, args, Discord){

        registerEvent(client);

        if(message.channel.id === canal) {
            let embed = new Discord.MessageEmbed()
                .setTitle('Ticket System')
                .setDescription('Generate a ticket by reacting to 🎫.')
                .setFooter('Ticket Tool made by HackMTY')
            message.channel.send(embed).then((msg) => {
                msg.react(emoji);
            }) 
                
        } else {
            message.channel.send(`You are in the incorrect channel. ${message.author} you must go to the channel ${message.guild.channels.cache.get(canal)}`)
        }

    }
}