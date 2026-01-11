const db = require("./db");
const { User, FamilyMember, Relationship } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { username: "Tester", email: "tester@example.com", passwordHash: User.hashPassword("test123") },
      { username: "user1", email: "user1@example.com", passwordHash: User.hashPassword("user111") },
      { username: "user2", email: "user2@example.com", passwordHash: User.hashPassword("user222") },
    ]);

    console.log(`👤 Created ${users.length} users`);

    // Create example family tree
    const familyMembers = await FamilyMember.bulkCreate([
      // Grandparents generation
      { firstname: "John", lastname: "Smith", date_of_birth: "1940-03-15", sex: "male" },
      { firstname: "Mary", lastname: "Smith", date_of_birth: "1945-07-22", sex: "female" },
      { firstname: "Robert", lastname: "Johnson", date_of_birth: "1942-11-10", sex: "male" },
      { firstname: "Patricia", lastname: "Johnson", date_of_birth: "1948-05-30", sex: "female" },
      
      // Parents generation
      { firstname: "James", lastname: "Smith", date_of_birth: "1965-01-20", sex: "male" },
      { firstname: "Linda", lastname: "Smith", date_of_birth: "1968-09-14", sex: "female" },
      { firstname: "Michael", lastname: "Johnson", date_of_birth: "1966-04-25", sex: "male" },
      { firstname: "Karen", lastname: "Johnson", date_of_birth: "1970-12-08", sex: "female" },
      
      // Current generation
      { firstname: "David", lastname: "Smith", date_of_birth: "1990-06-12", sex: "male" },
      { firstname: "Sarah", lastname: "Smith", date_of_birth: "1992-11-30", sex: "female" },
      { firstname: "Emily", lastname: "Johnson", date_of_birth: "1991-08-18", sex: "female" },
      { firstname: "Christopher", lastname: "Johnson", date_of_birth: "1993-02-07", sex: "male" },
    ]);

    console.log(`👨‍👩‍👧‍👦 Created ${familyMembers.length} family members`);

    // Create relationships (parent -> child)
    const relationships = await Relationship.bulkCreate([
      // Grandparents to Parents
      { parent_id: 1, child_id: 5 }, // John Smith -> James Smith
      { parent_id: 2, child_id: 5 }, // Mary Smith -> James Smith
      { parent_id: 1, child_id: 6 }, // John Smith -> Linda Smith
      { parent_id: 2, child_id: 6 }, // Mary Smith -> Linda Smith
      { parent_id: 3, child_id: 7 }, // Robert Johnson -> Michael Johnson
      { parent_id: 4, child_id: 7 }, // Patricia Johnson -> Michael Johnson
      { parent_id: 3, child_id: 8 }, // Robert Johnson -> Karen Johnson
      { parent_id: 4, child_id: 8 }, // Patricia Johnson -> Karen Johnson
      
      // Parents to Children
      { parent_id: 5, child_id: 9 },  // James Smith -> David Smith
      { parent_id: 6, child_id: 9 },  // Linda Smith -> David Smith
      { parent_id: 5, child_id: 10 }, // James Smith -> Sarah Smith
      { parent_id: 6, child_id: 10 }, // Linda Smith -> Sarah Smith
      { parent_id: 7, child_id: 11 }, // Michael Johnson -> Emily Johnson
      { parent_id: 8, child_id: 11 }, // Karen Johnson -> Emily Johnson
      { parent_id: 7, child_id: 12 }, // Michael Johnson -> Christopher Johnson
      { parent_id: 8, child_id: 12 }, // Karen Johnson -> Christopher Johnson
    ]);

    console.log(`🔗 Created ${relationships.length} family relationships`);
    console.log("🌱 Seeded the database");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();
