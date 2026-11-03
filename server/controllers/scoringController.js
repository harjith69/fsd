import { ScoringConfig } from '../models/ScoringConfig.js';
import { getOrInitScoringConfig, clearScoreCache } from '../services/scoring.js';
import { AuditLog } from '../models/AuditLog.js';

export const getScoringConfig = async (req, res, next) => {
  try {
    const config = await getOrInitScoringConfig();
    res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

export const updateScoringConfig = async (req, res, next) => {
  try {
    let config = await ScoringConfig.findOne({ isActive: true });
    if (!config) {
      config = new ScoringConfig();
    }

    if (req.body.weights) {
      const merged = { ...config.weights.toObject?.() ?? config.weights, ...req.body.weights };
      const keys = ['teaching', 'publications', 'fdp', 'consultancy', 'patents', 'feedback'];
      const values = keys.map((k) => Number(merged[k]));
      if (values.some((v) => !Number.isFinite(v) || v < 0)) {
        return res.status(400).json({ success: false, message: 'Every weight must be a number of 0 or more.' });
      }
      const total = values.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 0.001) {
        return res.status(400).json({ success: false, message: `Weights must add up to 100% (currently ${total}%).` });
      }
      config.weights = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
    }
    if (req.body.targets) config.targets = { ...config.targets, ...req.body.targets };
    if (req.body.pointsRules) config.pointsRules = { ...config.pointsRules, ...req.body.pointsRules };

    await config.save();

    // Invalidate all cached scores since configuration rules changed
    clearScoreCache();

    await AuditLog.create({
      user: req.user._id,
      action: 'CONFIG_CHANGE',
      entity: 'ScoringConfig',
      entityId: config._id,
    });

    res.status(200).json({
      success: true,
      message: 'Scoring configuration updated successfully.',
      config,
    });
  } catch (error) {
    next(error);
  }
};
