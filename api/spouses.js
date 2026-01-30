const express = require("express");
const router = express.Router();
const { Spouse, FamilyMember } = require("../database");

// GET all spouse relationships
router.get("/", async (_req, res) => {
  try {
    const spouses = await Spouse.findAll({
      attributes: ["partner1_id", "partner2_id"],
    });
    res.json(spouses);
  } catch (err) {
    console.error("READ spouses error:", err);
    res.status(500).json({ error: "Error fetching spouses" });
  }
});

// POST create spouse relationship
router.post("/", async (req, res) => {
  try {
    const { partner1_id, partner2_id } = req.body;

    if (!partner1_id || !partner2_id) {
      return res.status(400).json({ error: "Both partner IDs are required" });
    }

    if (partner1_id === partner2_id) {
      return res.status(400).json({ error: "Cannot create spouse relationship with the same person" });
    }

    // Check if both partners exist
    const partner1 = await FamilyMember.findByPk(partner1_id);
    const partner2 = await FamilyMember.findByPk(partner2_id);

    if (!partner1 || !partner2) {
      return res.status(404).json({ error: "One or both family members not found" });
    }

    // Check if relationship already exists (in either direction)
    const existing = await Spouse.findOne({
      where: {
        partner1_id: [partner1_id, partner2_id],
        partner2_id: [partner1_id, partner2_id],
      },
    });

    if (existing) {
      return res.status(400).json({ error: "This spouse relationship already exists" });
    }

    // Create new spouse relationship (always store with lower ID first)
    const newSpouse = await Spouse.create({
      partner1_id: Math.min(partner1_id, partner2_id),
      partner2_id: Math.max(partner1_id, partner2_id),
    });

    res.status(201).json(newSpouse);
  } catch (err) {
    console.error("CREATE spouse error:", err);
    res.status(500).json({ error: "Error creating spouse relationship" });
  }
});

// PUT update spouse relationship
router.put("/:partner1_id/:partner2_id", async (req, res) => {
  try {
    const { partner1_id: oldPartner1, partner2_id: oldPartner2 } = req.params;
    const { partner1_id, partner2_id } = req.body;

    const spouse = await Spouse.findOne({
      where: {
        partner1_id: Math.min(parseInt(oldPartner1), parseInt(oldPartner2)),
        partner2_id: Math.max(parseInt(oldPartner1), parseInt(oldPartner2)),
      },
    });

    if (!spouse) {
      return res.status(404).json({ error: "Spouse relationship not found" });
    }

    if (partner1_id === partner2_id) {
      return res.status(400).json({ error: "Cannot create spouse relationship with the same person" });
    }

    await spouse.update({
      partner1_id: Math.min(partner1_id, partner2_id),
      partner2_id: Math.max(partner1_id, partner2_id),
    });

    res.json(spouse);
  } catch (err) {
    console.error("UPDATE spouse error:", err);
    res.status(500).json({ error: "Error updating spouse relationship" });
  }
});

// DELETE spouse relationship
router.delete("/:partner1_id/:partner2_id", async (req, res) => {
  try {
    const { partner1_id, partner2_id } = req.params;

    const spouse = await Spouse.findOne({
      where: {
        partner1_id: Math.min(parseInt(partner1_id), parseInt(partner2_id)),
        partner2_id: Math.max(parseInt(partner1_id), parseInt(partner2_id)),
      },
    });

    if (!spouse) {
      return res.status(404).json({ error: "Spouse relationship not found" });
    }

    await spouse.destroy();
    res.json({ message: "Spouse relationship deleted" });
  } catch (err) {
    console.error("DELETE spouse error:", err);
    res.status(500).json({ error: "Error deleting spouse relationship" });
  }
});

module.exports = router;
