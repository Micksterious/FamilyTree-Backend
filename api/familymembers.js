// FamilyTree-Backend/api/familymembers.js
const express = require("express");
const router = express.Router();
const { FamilyMember, Relationship } = require("../database");

// CREATE
router.post("/", async (req, res) => {
  try {
    const member = await FamilyMember.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    console.error("CREATE familymember error:", err);
    res.status(500).json({ error: "Failed to create family member" });
  }
});

// READ all
// READ all
router.get("/", async (_req, res) => {
  try {
    const members = await FamilyMember.findAll({
      attributes: ["id", "firstname", "lastname", "date_of_birth", "sex"],
    });
    res.json(members);
  } catch (err) {
    console.error("READ familymembers error:", err);
    res.status(500).json({ error: "Failed to fetch family members" });
  }
});

// GET full family tree for Cytoscape visualization
router.get("/tree/cytoscape", async (_req, res) => {
  try {
    const members = await FamilyMember.findAll({
      attributes: ["id", "firstname", "lastname", "date_of_birth", "sex"],
    });

    const relationships = await Relationship.findAll({
      attributes: ["parent_id", "child_id"],
    });

    // Convert to Cytoscape format
    const nodes = members.map((member) => ({
      data: {
        id: `member-${member.id}`,
        label: `${member.firstname} ${member.lastname}`,
        firstname: member.firstname,
        lastname: member.lastname,
        dob: member.date_of_birth,
        sex: member.sex,
      },
    }));

    const edges = relationships.map((rel) => ({
      data: {
        id: `parent-${rel.parent_id}-child-${rel.child_id}`,
        source: `member-${rel.parent_id}`,
        target: `member-${rel.child_id}`,
      },
    }));

    res.json({
      nodes,
      edges,
    });
  } catch (err) {
    console.error("READ family tree error:", err);
    res.status(500).json({ error: "Failed to fetch family tree" });
  }
});

// READ by id
router.get("/:id", async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  } catch (err) {
    console.error("READ familymember by id error:", err);
    res.status(500).json({ error: "Failed to fetch family member" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    await member.update(req.body);
    res.json(member);
  } catch (err) {
    console.error("UPDATE familymember error:", err);
    res.status(500).json({ error: "Failed to update family member" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    await member.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE familymember error:", err);
    res.status(500).json({ error: "Failed to delete family member" });
  }
});

module.exports = router;
