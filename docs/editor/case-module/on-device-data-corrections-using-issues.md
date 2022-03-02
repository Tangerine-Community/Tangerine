# On Device Data Corrections using Issues

## Setup

### App Configuration

In your group's `app-config.json` (and `app-config.defaults.json`) add the following JSON settings. The first will make the list of Issues appear as a tab on the homescreen, the second will make a "New Issue" button appear when viewing submitted Event Forms.

```json
{
  "showIssues": true,
  "allowCreationOfIssues": true
}
```

### Template the Issue Title and Description
When creating an Issue on a Device, users are not allowed the opportunity to add define a Title and Description for the Issue they are creating. For this reason, you will find it helpful to develop templates for the Issue Title and Descriptions to give them context. These templates are built on a per Case Definition basis and are top level properties in any Case Definition.

```
{
  "templateIssueTitle": "Issue for ${caseDefinition.name} with Participant ID of ${T.case.getVariable('participant_id')}, by ${userName}",
  "templateIssueDescription": ""
}
```


## Usage
When configured, Data Collectors will have the opportunity to create Issues where they propose changes to forms. After clicking "New Issue", they will fill out the form with any changes they see fit. When submitting the form will save the proposed changes in the Issue. The Issue will then be synced up to the server for a Data Manager to review. If the Data Manager approves, they may merge the proposed changes from the server. When proposed changes are merged, the status of the Issue will change to closed and that status change of the Issue will replicate down to the Device on that Device's next sync. Note however the merged changes to the form will not be replicated down to the Device unless two-way sync is set up for that form. 