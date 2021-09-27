
const averageChangeTimeInSeconds = parseInt(process.argv[2])
const totalNumberOfChanges = parseInt(process.argv[3])

const changesPerHour = (60*60)/averageChangeTimeInSeconds
const processingTimeHours = totalNumberOfChanges / changesPerHour
const processingTimeDays = processingTimeHours / 24

console.log(`Processing time in days: ${processingTimeDays}`)
