const Task = require("../models/Task");

// Create task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      priority,
      status,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// Get all tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { order = "asc" } = req.query; // default asc
    const isAsc = order === "asc";

    const tasks = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $addFields: {
          sortDate: {
            $ifNull: [
              "$dueDate",
              isAsc ? new Date("9999-12-31") : new Date("0001-01-01")
            ]
          }
        }
      },
      { $sort: { sortDate: isAsc ? 1 : -1 } },
      { $project: { sortDate: 0 } }
    ]);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};


// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updates = ["title", "description", "dueDate", "priority", "status"];
    updates.forEach((field) => {
      if (field in req.body) task[field] = req.body[field];
    });

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
