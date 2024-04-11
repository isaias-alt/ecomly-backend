const { Schema, model } = require("mongoose");

const tokenSchema = Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  refreshToken: { type: String, required: true },
  accessToken: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 86400 }
});

exports.Token = model('Token', tokenSchema);