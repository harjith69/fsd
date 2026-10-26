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

    if (req.body.weights) config.weights = { ...config.weights, ...req.body.weights };
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
