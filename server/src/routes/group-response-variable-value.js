const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    const responseId = req.params.responseId
    const variableName = req.params.variableName
    const doc = await groupDb.get(responseId);
    const inputs = doc.items.reduce((inputs, item) => {
      return Array.isArray(item.inputs)
        ? [
          ...inputs,
          ...item.inputs
        ]
        : inputs
    }, [])
    const value = inputs.find(i => i.name === variableName)
      ? inputs.find(i => i.name === variableName).value
      : 'undefined'
    const dataType = inputs.find(i => i.name === variableName)
      ? inputs.find(i => i.name === variableName).dataType
      : 'undefined'
    if (value.includes('data:image/jpeg')) {
      log.debug("image from db as jpeg.")
      res.type('jpeg')
      const data = value.replace('data:image/jpeg;base64,', '')
      const buffer = Buffer.from(data, 'base64')
      return res.send(buffer)
    } else if (value.includes('data:image/png')) {
      log.debug("image from db as png.")
      res.type('png')
      const data = value.replace('data:image/png;base64,', '')
      const buffer = Buffer.from(data, 'base64')
      return res.send(buffer)
    } else if (value.includes('blob:file') || value.includes('blob:http') || value.includes('blob:https')) {
      log.debug("image from file.")
      let extension = 'jpg'
      if (dataType && dataType === 'video') {
        extension = 'webm'
      } else if (dataType && dataType === 'audio/wav') {
        extension = 'wav'
      }
      const filePath = `/tangerine/client/content/groups/${req.params.groupId}/client-uploads/${variableName}_${responseId}.${extension}`
      if (fs.existsSync(filePath)) {
        res.type(extension)
        return res.sendFile(filePath)
      } else {
        console.log("filePath", filePath)
        res.send({ statusCode: 404, data: "Media file not found."})
      }
      
    } else {
      res.send(value)
    }
  } catch (error) {
    console.error(error)
    log.error(error);
    res.status(500).send(error);
  }
}