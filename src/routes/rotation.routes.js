const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const generateRotation = require("../services/rotation.service");

router.post("/:roomId", auth, async (req, res) => {
    const { start_date, days } = req.body;

    await generateRotation(req.params.roomId, start_date, days || 30);
    res.json({ message: "Rotation schedule generated" });
});

module.exports = router;
