const express = require('express');
const router = express.Router();
const {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  assignAsset,
  deleteAsset,
} = require('../controllers/assetController');

// GET    /api/assets
router.get('/', getAllAssets);

// GET    /api/assets/:id
router.get('/:id', getAssetById);

// POST   /api/assets
router.post('/', createAsset);

// PUT    /api/assets/:id
router.put('/:id', updateAsset);

// PATCH  /api/assets/:id/assign
router.patch('/:id/assign', assignAsset);

// DELETE /api/assets/:id
router.delete('/:id', deleteAsset);

module.exports = router;
