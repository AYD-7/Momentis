import express from 'express';

const router = express.Router();

router.route('/events').post();

export default router;