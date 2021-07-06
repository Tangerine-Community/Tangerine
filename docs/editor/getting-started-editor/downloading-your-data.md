Downloading your data (Download CSV) 
============

Tangerine provides a download CSV function that is accessible from the Data section. 
Click Data->Download CSV. Here you will see a listing of all forms and a download icon beside each one of them.


<img src="../media/downloadCsv.png" width="570">


Click the download icon to get to the download screen page.

<img src="../media/image85.png" width="30">
to see the interface below. From here,
you can select the results for a specific month or year of data
collection.

On this page you will see a selection for Month, Year and personally identifiable information (PII). Please select the desired month and year for the CSV export file, or keep the * selection for all months and year of the data collection. 

If want to get anonymized data for sending to third parties, select the Exclude PII checkbox and then click Submit.

<img src="../media/downloadSelection.png" width="570">

!!! Warning 
    To make use of the Exclude PII function, all of your  personally identifiable inputs must be marked like such on the input edit page, or when inserting a new input/question on the insert new input page.

!!! Warning 
    To be able to download all the data select the \* on both Month and Year and click the SUBMIT button.

If the CSV generation was successful, the following screen will present the group name, Form id , Start time and progress of the CSV download. 
Click **Download** to download the file.

<img src="../media/downloadCsvFile.png" width="570">


Once the CSV has been downloaded, you can find it in your Downloads folder.


### Metadata included in CSV ###

Each csv output from data collected by Tangerine has a set of metadata variables that are automatically output. Here is the current list:

|Variable Name |	Meaning |
| ---------- | ------------------------------------------------|
|_id	|32-digit uuid identifying the unique form taken|
|formId	|text name of the form|
|startUnixtime	|unix timestamp that the form was first opened|
|endUnixtime	|unix timestamp that the form was completed|
|lastSaveUnixtime	|unix timestamp that the form was last opened and saved|
|buildId	|32-digit uuid identifying the app version|
|buildChannel	|type of build: will be either build or production|
|deviceId	|32-digit uuid identifying the registered device|
|groupId	|identifyer of the Tangerine group to which this device is registered|
|complete	|TRUE or FALSE, whether the form is complete|
|tangerineModifiedByUserId	3|2-digit uuid identifying the registered user who filled the form|
|caseId	|32-digit uuid identifying the Case the form is associated with|
|eventId	|32-digit uuid identifying the Event within the Case that the form is associated with|
|eventFormId	|32-digit uuid identifying the Form within the Event within the Case that the form is associated with|
|participantId	|32-digit uuid identifying the participant for whom the form was filled|


#### User Profile Metadata ####

The information for the user logged in to the Tangerine app is also included in the CSV outputs. This includes the metadata below. The location metadata is based on the location defined in the location list. The table below includes three location levels as an example. 

|Variable Name |	Meaning |
| ---------- | ------------------------------------------------|
|user-profile._id	|32-digit uuid identifying the registered user who filled the form|
|user-profile.item-1_firstOpenTime	|unix timestamp of when the form was opened|
|user-profile.item-1.first_name	|user's first name|
|user-profile.item-1.last_name	|user's last name|
|user-profile.item-1.gender	|user's gender|
|user-profile.item-1.phone	|user's phone number|
|user-profile.item-1.location.Region	|user's assigned Region|
|user-profile.item-1.location.District	|user's assigned District|
|user-profile.item-1.location.Village	|user's assigned Village|
