const router = require("express").Router();
const { Tag } = require("../models/index.model");
const { FailSchema, StringField } = require("@fraserelliott/fail");
const inputValidation = require("../middleware/inputvalidation.middleware");
const auth = require("../middleware/auth.middleware");

const tagSchema = new FailSchema();
tagSchema.add("name", new StringField().required().nonNull().maxLength(20));

// Route to add a tag
router.post("/", auth.validateToken, inputValidation.validate(tagSchema), async (req, res) => {
    try {
        const { name } = req.body;
        const tag = await Tag.create({ name });
        res.status(201).json(tag);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            try {
                const tag = await Tag.findOne({ where: { name: req.body.name } });
                if (tag)
                    return res.status(200).json(tag);
                return res.status(404).json({ error: "Tag not found" });
            } catch (findError) {
                return res.status(500).json({ error: "Error finding tag." });
            }
        }
        return res.status(500).json({ error: "Error creating tag." });
    }
});

// Route to get all tags
router.get("/", async (req, res) => {
    try {
        const tags = await Tag.findAll();
        res.json(tags);
    } catch (error) {
        return res.status(500).json({ error: "Error retrieving tags." });
    }
});

// Route to get a specific tag
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const tag = await Tag.findByPk(id);
        if (!tag)
            return res.status(404).json({ error: "Tag not found." });
        res.json(tag);
    } catch (error) {
        return res.status(500).json({ error: "Error retrieving tag." });
    }
});

// Route to update a specific tag
router.put("/:id", auth.validateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const id = req.params.id;
        const tag = await Tag.findByPk(id);
        if (!tag)
            return res.status(404).json({ error: "Tag not found." });
        await tag.update({ name });
        res.json(tag);
    } catch (error) {
        return res.status(500).json({ error: "Error updating tag." });
    }
});

// Route to delete a specific tag
router.delete("/:id", auth.validateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const tag = await Tag.findByPk(id);
        if (!tag)
            return res.status(404).json({ error: "Tag not found." });
        await tag.destroy();
        res.json(tag);
    } catch (error) {
        return res.status(500).json({ error: "Error deleting tag." });
    }
});

module.exports = router;