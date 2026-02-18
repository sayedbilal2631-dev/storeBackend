const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: string,
        required: true,
        max: [25, 'Max charcter are 25'],
    },
    email: {
        type: string,
        required: true,
    },
    password: {
        type: string,
        required: true
    }
}, { timestamps: true });

export const User = mongoose.model("User", { userSchema })