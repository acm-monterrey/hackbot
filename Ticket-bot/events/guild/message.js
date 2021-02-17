module.exports = (Discord, client, message) => {
    const prefix = '.'
    if(!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'embed'){
        client.commands.get('embed').execute(message, args, Discord);
    }
}