const DB = require('./db.js')
const log = require('tangy-log').log
const path = require('path')
const fs = require('fs')

const { UserProfile: UserProfile } = require('./classes/user-profile.class.js')

createUserProfile = async (req, res) => {
  let groupId = req.params.groupId

  try {
    let userProfile = new UserProfile(groupId)

    if (Object.keys(req.body).length > 0) {
      const inputs = req.body
      userProfile.addInputs(inputs)
    }

    const db = new DB(groupId)
    await db.put(userProfile);
    res.send(userProfile._id);
  } catch (err) {
    res.status(500).send(err)
  }
}

module.exports = {
  createUserProfile
}