const { Schema, model } = require('mongoose')

const checkq = Schema({
    profile: {
        adult: Boolean,
        firstHack:Boolean,
        name:String,
        school:String,
        graduationYear:String,
        gender:String,
        discordUsername:String
    },
    confirmation: {
        dietaryRestrictions: Array
    },
    status: {
        completedProfile:Boolean,
        admitted:Boolean,
        confirmed:Boolean,
        declined:Boolean,
        checkedIn:Boolean,
        reimbursementGiven:Boolean,
        tableNumber:String,
        admittedBy:String,
        confirmBy:Number
    },
    admin:Boolean,
    timestamp:Number,
    lastUpdated:Number,
    verified:Boolean,
    salt: Number,
    email:String,
    password:String,
    __v:String,
    teamCode:String,
}, { collection : "checkIn"})

//const checkq = Schema({}, { strict: false})


module.exports = model('checkIn', checkq)