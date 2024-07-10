const DB = require('./db.js');
const GROUPS_DB = new DB('groups');
const { v4: uuidV4 } = require('uuid');
const createFormKey = () => uuidV4();
const { createLoginJWT } = require('./auth-utils');

const login = async (req, res) => {
  try {

    const { groupId, accessCode } = req.params;

    const groupDb = new DB(groupId)
    let options = { key: accessCode, include_docs: true }
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    const results = await groupDb.query('responsesByUserProfileShortCode', options);
    const docs = results.rows.map(row => row.doc)
    const userProfileDoc = docs.find(doc => doc.form.id === 'user-profile');

    if (userProfileDoc) {
      let permissions = {groupPermissions: [], sitewidePermissions: []};
      const token = createLoginJWT({ "username": accessCode, permissions });
      return res.status(200).send({ data: { token } });
    } else {
      return res.status(401).send({ data: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ data: 'An error occurred attempting to login' });
  }
}

const saveResponse = async (req, res) => {
  try {
    const { groupId, formId } = req.params;

    const db = new DB(groupId);
    const data = req.body;
    data.formId = formId;
    await db.post(data);
    return res.status(200).send({ data: 'Response Saved Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Could not save response');
  }
};

const publishSurvey = async (req, res) => {
  let surveyInfo = {}
  try {
    const { formId, groupId } = req.params;
    const locked = req.body.locked || false;
    const data = (await GROUPS_DB.get(groupId));
    data.onlineSurveys = data.onlineSurveys ? data.onlineSurveys : [];
    let surveysIndex = data.onlineSurveys.findIndex((e) => e.formId === formId);
    surveyInfo = {
      formId,
      published: true,
      updatedOn: new Date(),
      updatedBy: req.user.name,
      uploadKey: createFormKey(),
      locked: locked
    };
    if (surveysIndex < 0) {
      data.onlineSurveys = [...data.onlineSurveys, surveyInfo];
      await GROUPS_DB.post(data);
    } else {
      data.onlineSurveys[surveysIndex] = surveyInfo
      await GROUPS_DB.put(data);
    }
    return res.status(200).send(surveyInfo);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Could  not Publish Survey');
  }
};

const unpublishSurvey = async (req, res) => {
  try {
    const { formId, groupId } = req.params;
    const data = (await GROUPS_DB.get(groupId));
    data.onlineSurveys = data.onlineSurveys ? data.onlineSurveys : [];
    let surveysIndex = data.onlineSurveys.findIndex((e) => e.formId === formId);
    data.onlineSurveys[surveysIndex] = {
      ...data.onlineSurveys[surveysIndex],
      published: false,
      updatedBy: req.user.name,
      updatedOn: new Date(),
    };
    delete data.onlineSurveys[surveysIndex].uploadKey;
    GROUPS_DB.put(data);
    return res.status(200).send({ data: 'Survey Unpublished Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Could  not Unpublish Survey');
  }
};

const getOnlineSurveys = async (req, res) => {
  try {
    const { groupId } = req.params;
    const formId = req.params.formId || null; // optional
    if (!groupId) {
      return res.status(500).send('Could  not find role');
    }
    const data = await GROUPS_DB.get(groupId);
    if (data.onlineSurveys) {
      if (formId) {
        return res.status(200).send({ data: data.onlineSurveys.filter((s) => s.formId === formId) });
      } else {
        return res.status(200).send({ data: data.onlineSurveys });
      }
    } else {
      return res.status(200).send({ data: [] });
    }
  } catch (error) {
    res.status(500).send('Could not find survey');
  }
}

module.exports = {
  login,
  saveResponse,
  publishSurvey,
  unpublishSurvey,
  getOnlineSurveys
}