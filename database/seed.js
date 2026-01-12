const db = require("./db");
const { User, FamilyMember, Relationship } = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      { 
        username: "Tester", 
        email: "tester@example.com", 
        passwordHash: User.hashPassword("123456"),
        role: "admin"
      },
      { 
        username: "user1", 
        email: "user1@example.com", 
        passwordHash: User.hashPassword("user111"),
        role: "user"
      },
      { 
        username: "user2", 
        email: "user2@example.com", 
        passwordHash: User.hashPassword("user222"),
        role: "user"
      },
    ]);

    console.log(`👤 Created ${users.length} users`);

    // Create family tree with 4 grandparents, 2 parents, 5 siblings
    const familyMembers = await FamilyMember.bulkCreate([
      // Grandparents generation (4)
      { firstname: "Margaret", lastname: "Chen", date_of_birth: "1945-03-15", sex: "female" },      // 1
      { firstname: "Robert", lastname: "Chen", date_of_birth: "1943-07-22", sex: "male" },          // 2
      { firstname: "Dorothy", lastname: "Javier", date_of_birth: "1947-11-10", sex: "female" },     // 3
      { firstname: "James", lastname: "Javier", date_of_birth: "1944-05-30", sex: "male" },         // 4
      
      // Parents generation (2)
      { firstname: "Mom", lastname: "Javier", date_of_birth: "1970-10-02", sex: "female" },         // 5 (daughter of Dorothy & James)
      { firstname: "Dad", lastname: "Javier", date_of_birth: "1951-11-06", sex: "male" },           // 6 (son of Margaret & Robert)
      
      // Siblings generation (5)
      { firstname: "Jr", lastname: "Javier", date_of_birth: "1984-04-20", sex: "male" },            // 7 - has 6 kids
      { firstname: "wander", lastname: "Javier", date_of_birth: "1992-02-05", sex: "male" },        // 8 - has 1 daughter (Summer)
      { firstname: "MO", lastname: "Javier", date_of_birth: "1994-01-08", sex: "male" },            // 9 - no kids
      { firstname: "Mich", lastname: "Javier", date_of_birth: "1996-02-20", sex: "male" },          // 10 - no kids
      { firstname: "Kat", lastname: "Javier", date_of_birth: "1998-12-15", sex: "female" },         // 11 - has 1 son (Matt)
      
      // Jr's 6 children (2 boys, 4 girls)
      { firstname: "CJ", lastname: "Javier", date_of_birth: "2006-03-21", sex: "male" },            // 12
      { firstname: "DAYDAY", lastname: "Javier", date_of_birth: "2010-01-27", sex: "male" },        // 13
      { firstname: "DORA", lastname: "Javier", date_of_birth: "2014-07-14", sex: "female" },        // 14
      { firstname: "Mona", lastname: "Javier", date_of_birth: "2016-05-27", sex: "female" },        // 15
      { firstname: "JJ", lastname: "Javier", date_of_birth: "2018-08-08", sex: "female" },          // 16
      { firstname: "7", lastname: "Javier", date_of_birth: "2020-03-11", sex: "female" },           // 17
      
      // wander's 1 daughter
      { firstname: "Summer", lastname: "Javier", date_of_birth: "2017-08-12", sex: "female" },      // 18
      
      // Kat's 1 son
      { firstname: "Matt", lastname: "Javier", date_of_birth: "2019-04-05", sex: "male" },          // 19
    ]);

    console.log(`👨‍👩‍👧‍👦 Created ${familyMembers.length} family members`);

    // Create relationships (parent -> child)
    const relationships = await Relationship.bulkCreate([
      // Grandparents to Parents
      { parent_id: 3, child_id: 5 }, // Dorothy Javier -> Mom
      { parent_id: 4, child_id: 5 }, // James Javier -> Mom
      { parent_id: 1, child_id: 6 }, // Margaret Chen -> Dad
      { parent_id: 2, child_id: 6 }, // Robert Chen -> Dad
      
      // Parents to Siblings (5 children)
      { parent_id: 5, child_id: 7 },  // Mom -> Jr
      { parent_id: 6, child_id: 7 },  // Dad -> Jr
      { parent_id: 5, child_id: 8 },  // Mom -> wander
      { parent_id: 6, child_id: 8 },  // Dad -> wander
      { parent_id: 5, child_id: 9 },  // Mom -> MO
      { parent_id: 6, child_id: 9 },  // Dad -> MO
      { parent_id: 5, child_id: 10 }, // Mom -> Mich
      { parent_id: 6, child_id: 10 }, // Dad -> Mich
      { parent_id: 5, child_id: 11 }, // Mom -> Kat
      { parent_id: 6, child_id: 11 }, // Dad -> Kat
      
      // Jr's 6 children
      { parent_id: 7, child_id: 12 }, // Jr -> CJ
      { parent_id: 7, child_id: 13 }, // Jr -> DAYDAY
      { parent_id: 7, child_id: 14 }, // Jr -> DORA
      { parent_id: 7, child_id: 15 }, // Jr -> Mona
      { parent_id: 7, child_id: 16 }, // Jr -> JJ
      { parent_id: 7, child_id: 17 }, // Jr -> 7
      
      // wander's 1 daughter
      { parent_id: 8, child_id: 18 }, // wander -> Summer
      
      // Kat's 1 son
      { parent_id: 11, child_id: 19 }, // Kat -> Matt
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