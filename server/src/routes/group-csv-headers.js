const axios = require('axios')

module.exports = async (req, res) => {
  const response = await axios.get(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-reporting/${req.params.formId}`)
  return res.send(response.data.columnHeaders)
}