const express = require('express');
const router = express.Router();
const { authenticateJWT, ensureLoggedIn } = require('../middleware/auth');
const Message = require('../models/message');


router.get('/:id', authenticateJWT, ensureLoggedIn, async function(req, res, next) {
    try {
        let message = await Message.get(req.params.id);

        
        if (req.user.username !== message.from_user.username && req.user.username !== message.to_user.username) {
            return next({ status: 401, message: "Unauthorized" });
        }

        return res.json({ message });
    } catch (e) {
        return next(e);
    }
});

router.post('/', authenticateJWT, ensureLoggedIn, async function(req, res, next) {
    try {
        let { to_username, body } = req.body;
        let from_username = req.user.username;

        let message = await Message.create({ from_username, to_username, body });

        return res.json({ message });
    } catch (e) {
        return next(e);
    }
});

router.post('/:id/read', authenticateJWT, ensureLoggedIn, async function(req, res, next) {
    try {
        let message = await Message.get(req.params.id);

        
        if (req.user.username !== message.to_user.username) {
            return next({ status: 401, message: "Unauthorized" });
        }

        message = await Message.markRead(req.params.id);

        return res.json({ message });
    } catch (e) {
        return next(e);
    }
});



module.exports = router;

