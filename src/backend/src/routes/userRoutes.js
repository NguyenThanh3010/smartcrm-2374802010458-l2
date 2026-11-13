const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const user = await userService.createStaff(req.body);

    return res.status(201).json({
      data: user,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;