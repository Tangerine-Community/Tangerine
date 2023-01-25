const axios = require('axios')

module.exports = async (req, res) => {
  try {
    const response = await axios.get(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-reporting/${req.params.formId}`)
    return res.send(response.data.columnHeaders)
  } catch (e) {
    return res.status(500).send({ data: `Could not find data.` });
  }
}