const { default: mongoose, Schema } = require("mongoose");


const storeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: string,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, { timeseries: true })

const store = mongoose.model("store", { storeSchema });