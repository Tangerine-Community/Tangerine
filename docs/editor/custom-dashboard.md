# Custom Dashboard in Tangerine's Web Interface

Data Managers can create custom dashboards in Tangerine's web interface. These dashboards can be used to display data from multiple forms in a single view. This is useful for monitoring data collection progress, or for displaying data in a way that is more useful than the default form views.

__Example Dashboards__

![Tangerine Teach](https://github.com/Tangerine-Community/tangerine-teach-editor-dashboard-example)


## Accessing MySQL Data in a Custom Dashboard

The code below provides and example of how to run the Tangerine APIs to get MySQL data in a custom dashboard. This code is written in JavaScript and uses the `fetch` API to make the request to the Tangerine server. The code also uses the `localStorage` to get the token from the browser's local storage which only works from within the Tangerine web interface for users who have permission.

```javascript
try {
      const appConfig = await window.T.appConfig.getAppConfig();
      this.serverUrl = appConfig.serverUrl;
      this.groupId = appConfig.groupId
      this.formId = appConfig.formId
    } catch (error) {
      console.error('Error: missing serverUrl in appConfig', error);
    }

    /*
    * The shape of the response is:
    * results[0]: rows
    * results[1]: headers
    */
    let results = [];
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Access-Control-Allow-Credentials': 'true',
        'authorization': token,
        'Content-Type': 'application/json; charset=utf-8'
      };

      const api = `mysql-api/get-table?groupId=${this.groupId}&formId=${this.formId}`;
      const response = await fetch(`${this.serverUrl}${api}`, {
        method: 'GET',
        headers: headers
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      results = await response.json();
    } catch (error) {
      // if this is localhost, we are in development mode and we can load the csv file directly
      if (window.location.hostname === 'localhost') {
        results = loadTestData();
      } else {
        console.error('Error fetching the mysql data:', error);
      }
    }
```