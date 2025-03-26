const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  task_name: { type: String, required: true },  // ✅ Fix: Rename from title → task_name
  due_datetime: { type: Date, required: true }, 
  category: { type: String },
  completed: { type: Boolean, default: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', TaskSchema);
