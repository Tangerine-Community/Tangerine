const DB = require('./db.js');
const GROUPS_DB = new DB('groups');
const { v4: uuidV4 } = require('uuid');
const createFormKey = () => uuidV4();

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
    return res.status(500).send('Could  not save response');
  }
};

const publishSurvey = async (req, res) => {
  try {
    const { formId, groupId } = req.params;
    const data = (await GROUPS_DB.get(groupId));
    data.onlineSurveys = data.onlineSurveys ? data.onlineSurveys : [];
    let surveysIndex = data.onlineSurveys.findIndex((e) => e.formId === formId);
    if (surveysIndex < 0) {
      const data = {
        formId,
        published: true,
        updatedOn: new Date(),
        updatedBy: req.user.name,
        uploadKey: createFormKey(),
      };
      data.onlineSurveys = [...data.onlineSurveys, { ...data }];
      await GROUPS_DB.post(data);
    } else {
      data.onlineSurveys[surveysIndex] = {
        ...data.onlineSurveys[surveysIndex],
        formId,
        published: true,
        updatedOn: new Date(),
        updatedBy: req.user.name,
        uploadKey: createFormKey(),
      };
      GROUPS_DB.put(data);
    }
    return res.status(200).send({ data: 'Survey Published Successfully' });
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

module.exports ={
    saveResponse,
    publishSurvey,
    unpublishSurvey
}