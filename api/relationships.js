// FamilyTree-Backend/api/relationships.js
const express = require("express");
const router = express.Router();
const { Relationship } = require("../database");

// list all
router.get("/", async (_req, res) => {
  try {
    const rows = await Relationship.findAll();
    res.json(rows);
  } catch (err) {
    console.error("READ relationships error:", err);
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
});

// get one
router.get("/parent/:parent_id/child/:child_id", async (req, res) => {
  try {
    const rel = await Relationship.findOne({
      where: { parent_id: req.params.parent_id, child_id: req.params.child_id },
    });
    if (!rel) return res.status(404).json({ error: "Not found" });
    res.json(rel);
  } catch (err) {
    console.error("READ relationship error:", err);
    res.status(500).json({ error: "Failed to fetch relationship" });
  }
});

// create
router.post("/", async (req, res) => {
  try {
    const rel = await Relationship.create(req.body);
    res.status(201).json(rel);
  } catch (err) {
    console.error("CREATE relationship error:", err);
    res.status(500).json({ error: "Failed to create relationship" });
  }
});

// update child_id
router.put("/:parent_id/:child_id", async (req, res) => {
  try {
    const rel = await Relationship.findOne({
      where: { parent_id: req.params.parent_id, child_id: req.params.child_id },
    });
    if (!rel) return res.status(404).json({ error: "Not found" });
    await rel.update({ child_id: req.body.new_child_id });
    res.json(rel);
  } catch (err) {
    console.error("UPDATE relationship error:", err);
    res.status(500).json({ error: "Failed to update relationship" });
  }
});

// delete
router.delete("/:parent_id/:child_id", async (req, res) => {
  try {
    const count = await Relationship.destroy({
      where: { parent_id: req.params.parent_id, child_id: req.params.child_id },
    });
    if (!count) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE relationship error:", err);
    res.status(500).json({ error: "Failed to delete relationship" });
  }
});

module.exports = router;
