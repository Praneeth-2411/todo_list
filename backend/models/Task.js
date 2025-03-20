const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  task_name: { type: String, required: true },
  due_date: { type: Date },
  category: { type: String },
  completed: { type: Boolean, default: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', TaskSchema);

