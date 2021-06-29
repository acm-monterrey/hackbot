const Discord = require("discord.js");
require('dotenv').config()
const client = new Discord.Client()
const fs = require('fs');

const broadcast = client.voice.createBroadcast();

// From a path
//broadcast.play('audio.m4a');

/*
broadcast.on('subscribe', dispatcher => {
    console.log('New broadcast subscriber!');
});

broadcast.on('unsubscribe', dispatcher => {
    console.log('Channel unsubscribed from broadcast :(');
});

// Play audio on the broadcast
const dispatcher = broadcast.play('audio.m4a');

// Play this broadcast across multiple connections (subscribe to the broadcast)


 */


/*
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("pong");
    }
})
 */

client.login(process.env.TOKEN)
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
var voice, player;

// To join channel
client.channels.fetch("channelid").join().then((connection) => {voice = connection});
//client.channels.get("channelid").join().then((connection) => {voice = connection});

// To stream audio
player = voice.play('audio.m4a');

