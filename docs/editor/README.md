# Editor Guides

## Getting Started

In Tangerine, you start by building your forms (evaluations, tools, or surveys) using the platform’s Editor interface. It is user-friendly and lets you set up the structure of your form and add all your questions using a variety of question types. Once you’re happy with the setup, you can preview your form to see how it looks and make any tweaks if needed.
Next, you deploy your app and install it on a mobile device or use it in the Chrome browser. Now, data collection begins. Tablet users can start filling out forms by selecting any of the ones created for their group. Data collectors sync their devices and make the data available on the platform’s backend. A data manager can export it as CSV file ready for reporting integration or direct analysis in Excel.

-	[Create a New Group](getting-started-editor/create-new-group.md)
-	[Create New Form](getting-started-editor/create-new-form.md) 
-	[Editing the Form](getting-started-editor/edit-form.md)
-	[Adding Sections and Questions](getting-started-editor/add-sections.md)
-	[Different Input Types](getting-started-editor/input-types.md)
-   [Location list import](getting-started-editor/input-types/#location)
-	[Skip Logic](getting-started-editor/skip-logic.md)
-	[Validation](getting-started-editor/validation.md)
- [Calculated Inputs](getting-started-editor/calculated-inputs.md)
-   [Deployment](../data-collector/deployment)
-  [Downloading your data](getting-started-editor/downloading-your-data.md)
-  [User Management](getting-started-editor/user-management.md)

## Advanced Form Programming Guides

- [Local Content Development with Tangerine Preview](advanced-form-programming/local-content-development.md)
- [Renaming Section IDs](advanced-form-programming/rename-section-ids.md)
- [Configuration Guide](advanced-form-programming/configuration.md)
- [Custom scripts](advanced-form-programming/custom-scripts.md)
- [Content-sets](advanced-form-programming/content-sets.md)
- [Custom-app](advanced-form-programming/custom-apps.md)
- [Custom Dashboard](advanced-form-programming/custom-dashboard.md)
- [Globals](advanced-form-programming/globals.md)
- [Password Policy](advanced-form-programming/password-policy.md)
- [Kiosk Mode](advanced-form-programming/kiosk-or-fullscreen-modes.md)
- [Form Versions](advanced-form-programming/form-versions.md)
- [Reserved words in Tangerine](advanced-form-programming/reserved-words.md)
- [Translations](advanced-form-programming/translations.md)
- [Custom Fonts](advanced-form-programming/custom-fonts.md)
- [Tangerine Form Developer's Cookbook](../editor/form-developers-cookbook/README.md)

  
## Case Module

  - [Case Management Data Model](case-module/case-data-model.md)
  - [Case Data Structure](case-module/data-structure.md)
  - [Case Management Group](case-module/case-management-group.md)
  - [Case Archive](case-module/case-archive.md)
  - [Case Module Cookbook](case-module/case-module-cookbook.md)
  - [Configuring Case functionality](case-module/README.md)
  - [Custom Case Reports](case-module/custom-case-reports.md)
  - [Get and Set Event Data](case-module/get-and-set-event-data.md)
  - [Workflow for Changing Location](case-module/how-to-create-a-workflow-for-changing-case-location.md)
  - [Pass Data Between Form](case-module/how-to-pass-data-between-forms-in-a-case.md)
  - [Use Respondse Data in Event](case-module/how-to-use-form-response-data-in-an-event-form-listing.md)
  - [Device Data Corrections](case-module/on-device-data-corrections.md)
  - [Device Data Corrections Using Issues](case-module/on-device-data-corrections-using-issues.md)
  - [Prepare Form Logic for Issues](case-module/prepare-form-logic-for-issues.md)



# Starting Points
| Role         | Function     | Skill Set  | User Guide   |
| ------------ | ------------ | ------------ | ------------ |
|  Forms Editor | Converts surveys into a digitial form using the Tangerine Form Editor and/or Javascript.  |  Web Form Editor, Javascript (For Advanced Functions only)  | [Form Editor Guide](editor/README.md) <br> [Tangerine Academy](https://moodle.tangerinecentral.org/course/view.php?id=37)|
 |  Data Collector | Field Level Data collector, administers surveys, directly handles devices loaded with Tangerine | Survey and Data Collection   | [Data Collector Guide](data-collector/README.md) <br> [Tangerine Academy](https://moodle.tangerinecentral.org/course/view.php?id=38)|
|  System Administrator | Install and implement the technical side of Tangerine.|AWS, SSL, SSH, running script in Terminal, Server/DB Management | [System Administrator Guide](system-administrator/README.md) |
|  Developer | Develop new features, bug fixes| Node.js, Angular, CouchDB | [Developer Guide](developer/README.md) |



The starting point for Tangerine is dependent on what your role with the product will be. Are you a Project Manager looking to deploy Tangerine to help you manage data collection in your next project? Are you a Systems Administrator working on the back-end to make sure that Tangerine is operational on your company's technology? Or are you a forms developer, taking the questions for the survey and creating the digital forms in Tangerine, or are you a in the field data collector actually running the surveys? Depending on which of these roles fits will define where you should start. 

Since Tangerine is an open-source platform, you are welcome to develop off of our code if you wish. Go to the [Tangerine Community](https://github.com/Tangerine-Community/Tangerine/) to see the code or navigate to our [Developer Guide](developer/README.md).