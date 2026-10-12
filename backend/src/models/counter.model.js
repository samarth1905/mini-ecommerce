// Keeps a running number per collection so products get ids 1, 2, 3 ...
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String, // e.g. "product"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Returns the next number. On first use it starts after the highest id already in use.
async function getNextSequence(key, currentMax = 0) {
  await Counter.updateOne({ _id: key }, { $setOnInsert: { seq: currentMax } }, { upsert: true });
  const counter = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true });
  return counter.seq;
}

module.exports = Counter;
module.exports.getNextSequence = getNextSequence;
