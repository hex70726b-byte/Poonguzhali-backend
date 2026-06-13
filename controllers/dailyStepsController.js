import DailySteps from "../models/DailySteps.js";

// GET /api/steps/:date
export const getStepsByDate = async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    let record = await DailySteps.findOne({ date });
    if (!record) {
      // Find the most recent record to inherit the limit
      const lastRecord = await DailySteps.findOne().sort({ date: -1 });
      const defaultLimit = lastRecord ? lastRecord.limit : 10000;
      
      return res.json({
        date,
        steps: 0,
        limit: defaultLimit,
      });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/steps/:date
export const updateStepsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { steps, limit } = req.body;
    
    let record = await DailySteps.findOne({ date });
    if (!record) {
      let finalLimit = limit;
      if (finalLimit === undefined) {
        const lastRecord = await DailySteps.findOne().sort({ date: -1 });
        finalLimit = lastRecord ? lastRecord.limit : 10000;
      }
      record = new DailySteps({
        date,
        steps: steps !== undefined ? steps : 0,
        limit: finalLimit,
      });
    } else {
      if (steps !== undefined) record.steps = steps;
      if (limit !== undefined) record.limit = limit;
    }
    
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
