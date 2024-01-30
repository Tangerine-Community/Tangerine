# Tangerine Data Structures - Document Collections and Types

If the goal is to have data output to CSV via the changes log, the collection property of the document should be "TangyFormResponse". This is the only collection that is currently supported by data processing on the server-side.

## TangyFormResponse

A TangyFormResponse is a JSON object that contains all the data that a user has entered into a Tangy Form. It is the data that is stored in the database when a user submits a Tangy Form. It is also the data that is returned when you call the dashboardService.getResponse() method.

Tangerine modules - such as CSV and mysql - can be adapted to support different data structures in a TangyFormResponse. 
The default case is to output a CSV file with a header row and a row for each TangyFormResponse. 
The header row contains the names of the inputs in the TangyFormResponse. The data rows contain the values of the inputs in the TangyFormResponse.

A register - such as an Attendance register used in Teach - is a snapshot of a list of things being tracked, such as students attending a class. (Contrast this to a typical TangyFormResponse that is a snapshot of form inputs.) A register is for collecting data about multiple people or objects, whereas a formResponse is collecting data for a single unit or participant. 
An example of a register is a form of type 'attendance' or 'scores' which is used to collect data in the Attendance feature of the Teach module. There is a property called attendanceList that has an array of students.  When processing the changes feed, the csv module detects the 'attendance' type and creates a new row for each student in the attendanceList. 

In the [case module context](../editor/project_managment/case-module/case-data-model.md), a case definition manages participants and the forms submitted with data about each participant. A class project does not have a file similar to a case definition; it is more rigid and stores much of those relationships in the app logic. 

One could say a case is similar to a Class in Teach in that Teach saves metadata about a school, classes and students, but it is a rigid structure. A case is more flexible and can be used to track any type of data.