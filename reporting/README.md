# Tangerine-Reporting

This application processes data and generates CSV.


## Installation

Before installing the app you must have [node](https://nodejs.org/en/download/) installed on your machine, then follow the steps below:

* Run `git clone git@github.com:Tangerine-Community/Tangerine-Reporting.git`

* cd `Tangerine-Reporting`

* Run `npm install` to install application packages

* Run `npm start` to start the app locally

## Testing

If you need to re-generate the _result database, restart the docker instance. In another terminal, run the folloiwng comand once it is back up:

```
docker exec -it tangerine-container  curl -H "Content-Type: application/json" -X POST -d '{"baseDb": "http://admin:password@localhost/db/group-mygroup", "resultDb": "http://admin:password@localhost/db/group-mygroup-result"}' http://localhost/reporting/assessment/headers/all
docker exec -it tangerine-container  curl -H "Content-Type: application/json" -X POST -d '{"baseDb": "http://admin:password@localhost/db/group-mygroup", "isLive": false, "startPoint": 0, "resultDb": "http://admin:password@localhost/db/group-mygroup-result"}' http://localhost/reporting/tangerine_changes
```


## License

This project is licensed under the GPLv3 License - see the [LICENSE.txt](LICENSE.txt) file for details.
