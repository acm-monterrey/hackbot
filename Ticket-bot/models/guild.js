const { Schema, model } = require('mongoose')

const guild = new Schema({
    guildID: String,
    ticketCount: Number,
}, { collection: 'guilds'})

module.exports = model('guild', guild)