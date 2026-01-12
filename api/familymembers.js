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
      attributes: ["id", "firstname", "lastname", "date_of_birth", "date_of_death", "sex"],
    });

    const relationships = await Relationship.findAll({
      attributes: ["parent_id", "child_id"],
    });

    // Group children by parent for sorting
    const childrenByParent = {};
    relationships.forEach((rel) => {
      if (!childrenByParent[rel.parent_id]) {
        childrenByParent[rel.parent_id] = [];
      }
      childrenByParent[rel.parent_id].push(rel.child_id);
    });

    // Sort siblings by birth date (oldest to youngest)
    Object.keys(childrenByParent).forEach((parentId) => {
      childrenByParent[parentId].sort((aId, bId) => {
        const memberA = members.find(m => m.id === aId);
        const memberB = members.find(m => m.id === bId);
        
        const dateA = memberA?.date_of_birth ? new Date(memberA.date_of_birth) : new Date('9999-12-31');
        const dateB = memberB?.date_of_birth ? new Date(memberB.date_of_birth) : new Date('9999-12-31');
        
        return dateA - dateB;
      });
    });

    // Convert to Cytoscape format
    const nodes = members.map((member) => ({
      data: {
        id: `member-${member.id}`,
        label: `${member.firstname} ${member.lastname}`,
        firstname: member.firstname,
        lastname: member.lastname,
        birthDate: member.date_of_birth,
        deathDate: member.date_of_death,
        sex: member.sex,
      },
    }));

    // Create edges maintaining the sorted order
    const edges = [];
    let edgeOrder = 0;
    
    relationships.forEach((rel) => {
      const siblings = childrenByParent[rel.parent_id] || [];
      const childPosition = siblings.indexOf(rel.child_id);
      
      edges.push({
        data: {
          id: `parent-${rel.parent_id}-child-${rel.child_id}`,
          source: `member-${rel.parent_id}`,
          target: `member-${rel.child_id}`,
          order: edgeOrder + childPosition, // Add order hint for layout
        },
      });
    });

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
