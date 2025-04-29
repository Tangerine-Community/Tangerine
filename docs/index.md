---
title: Home
---
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
        width: calc(45% - 10px); /* (100% - gap) / 2 */
    }
}
</style>

# Getting started with Tangerine

<div class="card-container">
<div class="card">
    <h3>Get Started Quickly</h3>
    <p>End user documentation</p>
    <a href="./getting-started">Learn More</a>
  </div>
    <div class="card">
    <h3>Setup your own Platform</h3>
    <p>System Administrator setup your site</p>
    <a href="./system-administrator/installation">Learn More</a> 
  </div>
  <div class="card">
    <h3>Get Involved </h3>
    <p>Developer documentation</p>
    <a href="./get-involved">Learn More</a>
  </div>
  <div class="card">
    <h3>Learn</h3>
    <p>Learn Tangerine through our practical courses</p>
    <a href="https://moodle.tangerinecentral.org/course/index.php?categoryid=14">Learn More</a>
  </div>
  <div class="card">
    <h3>Sign up for Hosted Service</h3>
    <p>Sign up for a hosted plan</p>
    <a href="https://www.tangerinecentral.org/pricing">Learn More</a>
  </div>
  

  
</div>

## Key Features

<div class="card-container">
  <div class="  full">
    <h3>Core Functionality & Form Building</h3>
    <p>
        <ul><li>Flexible form building </li>
            <li>Diverse questioning types </li>
            <li>Point and click interface </li>
            <li>Customizable design</li>
            <li>Product Suite</li>
        </ul> </p>

  </div>
  <div class="  full">
    <h3>Data Collection Methods</h3>
    <p><ul><li>Offline data collection via app</li>
            <li>Online forms </li>
           </ul> </p>

  </div>
  <div class="  full">
    <h3>Data Quality & Management</h3>
   <p>
        <ul><li>Data validation and quality control  </li>
        <li>Conditional logic workflows  </li>
            <li>Data security and privacy  </li>
        </ul> </p>

  </div>
  <div class="  full">
    <h3>User & System Management</h3>
   <p>
        <ul><li>Data validation and quality control  </li>
        <li>User management and roles  </li>
            <li>Multilingual support  </li>
        </ul> </p>

  </div>
  <div class="  full">
    <h3>Advanced Features & Automation</h3>
   <p>
        <ul><li>Automated workflows  </li>
        <li>Custom scripting  </li>
            <li>Custom app interfaces  </li>
            <li>Predefined content sets  </li>
        </ul> </p>

  </div>
    <div class="  full">
    <h3>Foundational Aspect</h3>
   <p>
        <ul><li>Free and reliable platform  </li>
            <li>In use since 2012  </li>
            <li>Hundreds of data collections  </li>
        </ul> </p>

  </div>

</div>


## How it works

In Tangerine, the workflow is comprised of 4 steps:
1. Design your data collection forms in your favorite editor (Word, Excel, etc)
2. Digitize your forms and  create an app for deployment, 
3. Install the app onto the device, conduct your data collection and upload your form results from the tablet
4. Access your data on the backend by exporting a CSV file

![How it works](how-it-works.png)


## How to Contribute Documentation

[Contribute Documentation](CONTRIBUTING.md)