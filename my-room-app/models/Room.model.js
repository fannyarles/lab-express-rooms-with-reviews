const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
  });

const Rooms = model('Room', roomSchema);

module.exports = Rooms;