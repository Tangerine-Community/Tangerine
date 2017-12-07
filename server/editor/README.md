# Raisin

a restly node server for Tangerinev3

## API

* project/create: POST: The new projectName is POSTed to the server. Checks if it exists; if not, creates the dir in the
projectRoot and clones the tangy-eftouch repo. Returns a json object that provides an updated list of projects and success message.

* /project/listAll: GET - Lists all directories in projectRoot, returns an array.

* /project/projectName: GET - Serves a static site for this projectName

* / : status message