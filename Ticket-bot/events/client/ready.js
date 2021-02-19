module.exports = (client, Discord) => {
    console.log('Hackbot Ticket system is now online!');

    client.user.setPresence({ activity: { name: 'with HackMTY' }, status: 'idle' }).catch(console.error);

    const canal = '811517697988755486';
    const categoria = '811503336766832650';
    const emoji = '🎫';
    let registered = false;
    const canalTexto = client.channels.cache.get(canal);

    let embed = new Discord.MessageEmbed()
        .setTitle('Ticket System')
        .setDescription('Generate a ticket by reacting to 🎫.')
        .setFooter('Ticket Tool made by HackMTY')
    canalTexto.send(embed).then((msg) => {
        msg.react(emoji);
    }) 
}