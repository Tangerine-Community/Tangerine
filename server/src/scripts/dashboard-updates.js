#!/usr/bin/env node

const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       translations-up	date')
  process.exit()
}

async function go() {
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
	  await exec(`cp /tangerine/content-sets/default/editor/index.html* /tangerine/groups/${groupName}/editor/`);
	  await exec(`cp /tangerine/content-sets/default/client/reports/form.html*  /tangerine/groups/${groupName}/client/reports/`);
  }
}
go()




dotnet publish -c release -r win10-x64



curl 'https://psbi.tangerinecentral.org/api/create/csvDataSet/group-39e5ab77-c148-4934-b348-d05f88e1bd32'
  
  
  --data-raw '{"formIds":"user-profile,case-type-1-manifest,Initial,a_1_form,a_2_form,a_3_form,b_1_form,b_2_form,b_3_form,c_1_form,n_1_form,d_1_form,e_1_form,Mapcue,participant,event-form,case-event","selectedMonth":"*","selectedYear":"*"}' \
  --compressed


response
{"id":"296446479ba77f20e69f31d71d00005c","stateUrl":"https://psbi.tangerinecentral.org/csv/PSBI_Dev-1649675796283.state.json","downloadUrl":"https://psbi.tangerinecentral.org/csv/PSBI_Dev-1649675796283.zip"}



https://psbi.tangerinecentral.org/apis/CSVDatasetDetail/296446479ba77f20e69f31d71d00005c


{"_id":"group-23d4817a-e6d5-4735-b191-492259495927","_rev":"4-4a483e93e6cb7ad926f94c4121c71edc","label":"SL SelfEval RAN","created":"2023-01-19T15:55:48.898Z","roles":[{"role":"Admin","permissions":["can_access_configure","can_access_configure_sync","can_access_configure_location_list","can_access_security","can_manage_group_users","can_access_data","can_access_uploads","can_access_download_csv","can_access_cases","can_delete_cases","can_archive_cases","can_unarchive_cases","can_restore_conflict_event","can_access_issues","can_access_database_conflicts","can_access_author","can_access_forms","can_manage_forms","can_access_media","can_access_deploy","can_access_device_users","can_access_devices","can_access_releases","can_administer_couchdb_server"]},{"role":"Member","permissions":["can_access_author","can_access_forms","can_access_data","can_access_download_csv"]}],"releases":[{"build":"PWA","releaseType":"qa","buildId":"d575114d-e262-4459-9568-feaad33ebb3e","versionTag":"2023-01-19-17-14-06","releaseNotes":"","tangerineVersion":"v3.24.4-rc-2","date":1674144848710},{"build":"PWA","releaseType":"qa","buildId":"e30eedfc-0d26-4dd2-840a-debd33800310","versionTag":"2023-01-19-17-18-01","releaseNotes":"","tangerineVersion":"v3.24.4-rc-2","date":1674145083386},{"build":"APK","releaseType":"prod","buildId":"c38d68a9-13b9-4fab-bf7a-b37630b7898a","versionTag":"2023-01-19-17-34-22","releaseNotes":"","tangerineVersion":"v3.24.4-rc-2","date":1674146065166}]}
