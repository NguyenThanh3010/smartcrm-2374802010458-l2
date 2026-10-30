const express = require('express');
const service = require('../services/lookupService');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// GET /api/lookups/issue-categories
router.get(
  '/issue-categories',
  asyncHandler(async (req, res) => {
    const data = await service.listActiveIssueCategories();
    res.json({ data });
  })
);

// GET /api/lookups/service-centers
router.get(
  '/service-centers',
  asyncHandler(async (req, res) => {
    const data = await service.listActiveServiceCenters();
    res.json({ data });
  })
);

module.exports = router;
