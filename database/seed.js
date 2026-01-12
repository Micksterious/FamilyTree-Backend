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
      { firstname: "Dorothy", lastname: "Martinez", date_of_birth: "1947-11-10", sex: "female" },   // 3
      { firstname: "James", lastname: "Martinez", date_of_birth: "1944-05-30", sex: "male" },       // 4
      
      // Parents generation (2)
      { firstname: "Linda", lastname: "Martinez", date_of_birth: "1970-01-20", sex: "female" },     // 5 (daughter of Dorothy & James)
      { firstname: "David", lastname: "Martinez", date_of_birth: "1968-09-14", sex: "male" },       // 6 (son of Margaret & Robert)
      
      // Siblings generation (5)
      { firstname: "Jr", lastname: "Martinez", date_of_birth: "1990-06-12", sex: "female" },     // 7 - has 6 kids
      { firstname: "Michael", lastname: "Martinez", date_of_birth: "1992-11-30", sex: "male" },     // 8 - has 1 daughter
      { firstname: "Jennifer", lastname: "Martinez", date_of_birth: "1994-08-18", sex: "female" },  // 9 - has 1 son
      { firstname: "Christopher", lastname: "Martinez", date_of_birth: "1996-02-07", sex: "male" }, // 10 - no kids
      { firstname: "Amanda", lastname: "Martinez", date_of_birth: "1998-12-15", sex: "female" },    // 11 - no kids
      
      // Sarah's 6 children (2 boys, 4 girls)
      { firstname: "Emma", lastname: "Martinez", date_of_birth: "2010-03-22", sex: "female" },      // 12
      { firstname: "Lucas", lastname: "Martinez", date_of_birth: "2012-07-14", sex: "male" },       // 13
      { firstname: "Sophia", lastname: "Martinez", date_of_birth: "2014-09-08", sex: "female" },    // 14
      { firstname: "Owen", lastname: "Martinez", date_of_birth: "2016-11-25", sex: "male" },        // 15
      { firstname: "Lily", lastname: "Martinez", date_of_birth: "2018-05-17", sex: "female" },      // 16
      { firstname: "Mia", lastname: "Martinez", date_of_birth: "2020-01-30", sex: "female" },       // 17
      
      // Michael's 1 daughter
      { firstname: "Zoe", lastname: "Martinez", date_of_birth: "2017-08-12", sex: "female" },       // 18
      
      // Jennifer's 1 son
      { firstname: "Tyler", lastname: "Martinez", date_of_birth: "2019-04-05", sex: "male" },       // 19
    ]);

    console.log(`👨‍👩‍👧‍👦 Created ${familyMembers.length} family members`);

    // Create relationships (parent -> child)
    const relationships = await Relationship.bulkCreate([
      // Grandparents to Parents
      { parent_id: 3, child_id: 5 }, // Dorothy Martinez -> Linda Martinez
      { parent_id: 4, child_id: 5 }, // James Martinez -> Linda Martinez
      { parent_id: 1, child_id: 6 }, // Margaret Chen -> David Martinez
      { parent_id: 2, child_id: 6 }, // Robert Chen -> David Martinez
      
      // Parents to Siblings (5 children)
      { parent_id: 5, child_id: 7 },  // Linda -> Sarah
      { parent_id: 6, child_id: 7 },  // David -> Sarah
      { parent_id: 5, child_id: 8 },  // Linda -> Michael
      { parent_id: 6, child_id: 8 },  // David -> Michael
      { parent_id: 5, child_id: 9 },  // Linda -> Jennifer
      { parent_id: 6, child_id: 9 },  // David -> Jennifer
      { parent_id: 5, child_id: 10 }, // Linda -> Christopher
      { parent_id: 6, child_id: 10 }, // David -> Christopher
      { parent_id: 5, child_id: 11 }, // Linda -> Amanda
      { parent_id: 6, child_id: 11 }, // David -> Amanda
      
      // Sarah's 6 children
      { parent_id: 7, child_id: 12 }, // Sarah -> Emma
      { parent_id: 7, child_id: 13 }, // Sarah -> Lucas
      { parent_id: 7, child_id: 14 }, // Sarah -> Sophia
      { parent_id: 7, child_id: 15 }, // Sarah -> Owen
      { parent_id: 7, child_id: 16 }, // Sarah -> Lily
      { parent_id: 7, child_id: 17 }, // Sarah -> Mia
      
      // Michael's 1 daughter
      { parent_id: 8, child_id: 18 }, // Michael -> Zoe
      
      // Jennifer's 1 son
      { parent_id: 9, child_id: 19 }, // Jennifer -> Tyler
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