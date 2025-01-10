
const PouchDB = require('pouchdb');
const usersDB = new PouchDB('https://admin:t4ngerines33d@irceducation.tangerinecentral.org/db/users');
const groupsDB = new PouchDB('https://admin:t4ngerines33d@irceducation.tangerinecentral.org/db/groups');

// Function to fetch group names based on group IDs
async function getGroupNames(groupIds) {
  const groupNames = [];
  for (const groupId of groupIds) {
    try {
      const groupDoc = await groupsDB.get(groupId);
      groupNames.push(groupDoc.label);
    } catch (error) {
      console.error(`Error fetching group ${groupId}: ${error.message}`);
    }
  }
  return groupNames;
}

// Function to process users and fetch group names and roles
async function processUsers() {
  try {
    // Fetch all documents from 'users' database
    const allUsers = await usersDB.allDocs({ include_docs: true });

    // Iterate over each user document
    for (const row of allUsers.rows) {
      const userDoc = row.doc;
      const userId = userDoc._id;
      const userRoles = [];
      const groupIds = [];

      // Extract roles and group IDs from user document
      if (userDoc.groups && userDoc.groups.length > 0) {
        for (const group of userDoc.groups) {
          if (group.roles && group.roles.length > 0) {
            userRoles.push(...group.roles);
          }
          if (group.groupName) {
            groupIds.push(group.groupName);
          }
        }
      }

      // Fetch group names based on group IDs
      const groupNames = await getGroupNames(groupIds);

      // Output user, roles, and group names
      console.log(`User ID: ${userId}`);
      console.log(`Roles: ${userRoles.join(', ')}`);
      console.log(`Groups: ${groupNames.join(', ')}`);
      console.log('-----------------------------');
    }
  } catch (error) {
    console.error(`Error processing users: ${error.message}`);
  }
}

// Call the function to start processing users
processUsers();
