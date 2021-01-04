const DB = require('./db.js');
const GROUPS_DB = new DB('groups');
const util = require('util')
const fs = require('fs-extra')
const exec = util.promisify(require('child_process').exec)
const sanitize = require('sanitize-filename');
const PACKAGENAME = "org.rti.tangerine"
const APPNAME = "Tangerine"
const log = require('tangy-log').log;
const { group } = require('console');

const saveReleaseInfo = async(groupId, build,releaseType, buildId,versionTag, releaseNotes) => {
	try {
		const myGroup = await GROUPS_DB.get(groupId);
		const tangerineVersion = process.env.T_VERSION;
		myGroup.releases = myGroup.releases ? myGroup.releases : [];
		myGroup.releases = [...myGroup.releases, { build, releaseType, buildId, versionTag, releaseNotes, tangerineVersion,date: Date.now()}];
		await GROUPS_DB.put(myGroup);
		const cmd = `cd /tangerine/groups/${sanitize(groupId)} && git tag ${sanitize(buildId)}`
		await exec(cmd)
		
	} catch (error) {
		console.error(error);
	}
}
const releaseAPK =async (req, res) => {
	// @TODO Make sure user is member of group.
	try {
		const group = sanitize(req.params.group)
		const {releaseType, versionTag, releaseNotes, buildId} = req.body;
		const config = JSON.parse(await fs.readFile(`/tangerine/groups/${group}/client/app-config.json`, "utf8"));
		const packageName = config.packageName? config.packageName: PACKAGENAME
		const appName = config.appName ? config.appName: APPNAME
		const cmd = `cd /tangerine/server/src/scripts && ./release-apk.sh ${group} /tangerine/groups/${group}/client ${sanitize(releaseType)} ${process.env.T_PROTOCOL} ${process.env.T_HOST_NAME} ${sanitize(packageName)} "${sanitize(appName)}" ${sanitize(buildId)} 2>&1 | tee -a /apk.log`
			log.info("in release-apk, group: " + group + " releaseType: " + releaseType + ` The command: ${cmd}`)
            // Do not await. The browser just needs to know the process has started and will monitor the status file.
            exec(cmd).catch(log.error)
            await saveReleaseInfo(group, 'APK',sanitize(releaseType), sanitize(buildId), sanitize(versionTag), sanitize(releaseNotes))
            res.send({ statusCode: 200, data: 'ok', buildId})
	} catch (error) {
		console.log({error})
		res.send({ statusCode: 500, data: error })
	}
}

const releasePWA = async (req, res)=>{
	// @TODO Make sure user is member of group.
	try {
		const group = sanitize(req.params.group)
		const {releaseType, versionTag, releaseNotes, buildId} = req.body;
		const cmd = `release-pwa ${group} /tangerine/groups/${group}/client ${sanitize(releaseType)} ${sanitize(buildId)}`
		log.info("in release-pws, group: " + group + " releaseType: " + releaseType + ` The command: ${cmd}`)
		log.info(`RELEASING PWA: ${cmd}`)
        await exec(cmd)
		await saveReleaseInfo(group, 'PWA',sanitize(releaseType), sanitize(buildId), sanitize(versionTag), sanitize(releaseNotes))
		res.send({ statusCode: 200, data: 'ok', buildId})
	} catch (error) {
		console.error(error)
		res.send({ statusCode: 500, data: error })
	}
}

const releaseOnlineSurveyApp = async(req, res) => {
	// @TODO Make sure user is member of group.
	const groupId = sanitize(req.params.groupId)
	const formId = sanitize(req.params.formId)
	const releaseType = sanitize(req.params.releaseType)
	const appName = sanitize(req.params.appName)
	const uploadKey = sanitize(req.params.uploadKey)

	try {
		const cmd = `release-online-survey-app ${groupId} ${formId} ${releaseType} "${appName}" ${uploadKey} `
		log.info(`RELEASING Online survey app: ${cmd}`)
		await exec(cmd)
		res.send({ statusCode: 200, data: 'ok' })
	} catch (error) {
		res.send({ statusCode: 500, data: error })
	}
}

const unreleaseOnlineSurveyApp = async (req, res) => {
	// @TODO Make sure user is member of group.
	const groupId = sanitize(req.params.groupId)
	const formId = sanitize(req.params.formId)
	const releaseType = sanitize(req.params.releaseType)
	try {
		const cmd = `rm -rf /tangerine/client/releases/${releaseType}/online-survey-apps/${groupId}/${formId}`
		log.info(`UNRELEASING Online survey app: ${cmd}`)
		await exec(cmd)
		res.send({ statusCode: 200, data: 'ok' })
	} catch (error) {
		res.send({ statusCode: 500, data: error })
	}
}
const commitFilesToVersionControl = async () => {
	const groups = await GROUPS_DB.allDocs({include_docs:false})
	for (let group of groups.rows) {
		const cmd = `cd /tangerine/groups/${groupId} && git add -A && git commit -m 'auto-commit' `
		try {
			const groupId = sanitize(group.id);
			await exec(cmd);
		}
		catch (error) {
			// Do nothing. If it failed it's probably because there was nothing to commit.
		}
	}
}
module.exports ={
	commitFilesToVersionControl,
	releaseAPK,
	releaseOnlineSurveyApp,
	releasePWA,
	unreleaseOnlineSurveyApp
}
