<style>
.card-container {
    display: flex;
    flex-wrap: wrap; /* Allow cards to wrap to the next line */
    gap: 10px; /* Add space between cards */
}

.card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    width: calc(95% - 10px); /* Adjust width to account for the gap */
    margin-bottom: 10px; /* Space between rows */
}
.full {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    width: calc(100vh - 10px); /* Adjust width to account for the gap */
    margin-bottom: 10px; /* Space between rows */
}

.card h3, .full h3 {
      margin-top: 0;
      color: #333;
    }

    .card p, .full  p {
      line-height: 1.5;
      color: #555;
    }

    .card a, .full  a {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 12px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }

    @media (min-width: 768px) {
    .card {
        /* Calculate width for two columns with a gap */
        width: calc(50% - 10px); /* (100% - gap) / 2 */
    }
}
</style>

# Tangerine app Installation

There are two ways you can install an app on a mobile device:
- Using an APK file
- Using a Browser app (PWA)

!!! warning 

    When using browser app installation, it is important to keep in mind that the app lives in the browser’s data/cache. If you use incognito mode, the <b>app and data will be removed</b> every time you close the browser. Some people clear their cache for the browser which also results in <b>complete removal of app and data.</b>

    Users using the Browser app installation must always <b>use the same browser</b> in regular mode (not incognito) and never clear the cache.

    If you are using Browser installation, you should <b>never install the app for more than one groups</b> at the same time. If switching groups, the user must sync and then clear the previous app to install a new one. If mixing between groups data contamination may occur where the data for one group is uploaded to another.

<div class="card-container">
<div class="card">
    <h3>Android APK installation</h3>
    <p>For detailed instructions read through the section Android Installation</p>
     <a href="../deployment/#using-apk-installation">Go to Guide</a>
  </div>
  <div class="card">
    <h3>Browser Installation on Tablets </h3>
    <p>For detailed instructions read through the section Using Browser Installation  </p>
     <a href="../deployment/#using-browser-installation-on-tablets">Go to Guide</a>
  </div> 

</div>
Case Module Installation
<div class="card-container">

<div class="card">
    <h3>Android APK Device Setup</h3>
    <p>For detailed instructions read through the section Using Device Setup Installation </p>
     <a href="../deployment/#using-device-setup-installation-2-way-sync-setup">Go to Guide</a>
  </div>
  <div class="card">
    <h3>Browser Installation on Tablets </h3>
   <p>For detailed instructions read through the section Using Browser Installation</p>
    <a href="../deployment/#installation-of-apk-on-a-tabletphone">Go to Guide</a>
  
  </div>

</div>

