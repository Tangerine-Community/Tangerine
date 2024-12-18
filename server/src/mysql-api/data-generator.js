const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const mysqlKnex = require('./mysql-knex.js')

async function initializeConnection(groupId) {
    try {
        await mysqlKnex.initializeConnection(groupId);
    } catch (err) {
        console.log(err)
    }
}

async function getTableData(groupId, formId) {
    let results = {};
    try {
        await initializeConnection(groupId);
        results = await mysqlKnex.getTableData(groupId, formId)
        if (Array.isArray(results) && results.length > 0) {
            //const csvFileName = `/tmp/${groupId}.${formId}.csv`
            results[1] = results[1].map((record) => {
               return { id: record.name, title: record.name }
            });
            /*
            const csvWriter = createCsvWriter({
                path: csvFileName,
                header: headers
            });
            const records = results[0];
            await csvWriter.writeRecords(records)

            return csvFileName
            */
            
        }
    } catch (err) {
        console.log(err)
    } finally {
        await mysqlKnex.closeConnection();
        return results
    }
}

module.exports = {
    getTableData
}
