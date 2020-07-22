# Installing Tangerine on AWS

## Creating the AWS instance
Login to AWS and Launch a new instance with Ubuntu 16.04 using a t2.medium server with 4 GiB memory. 

Volume should be larger than the 8GB default. 24GB would be useful.

### Security
Make sure to assign a security group to your instance that allows you to access port 80 via a web browser and port 22 via ssh. 

- HTTP: TCP	80	0.0.0.0/0
- SSH	TCP	22	0.0.0.0/0


## Set up SSL
Prerequisites:
- An SSL Certificate. If you don't yet have one, we recommend using AWS's Certificate Manager (found under "Security, Identity, and Compliance").

Create and Configure an Elastic Load Balancer (ELB):
- Go to EC2, click "Load Balancers" in the left column, click "Create Load Balancer", and then select "Classic Load Balancer". 
- Step 1: Define Load Balancer 
  - Set a Load Balancer name to what you want.
  - Set "Load Balancer Protocol" on the left most column to "HTTPS".
  - Set "Instance Protocol" in the third column to "HTTP". 
  - Click "Add".
  - In the new row set "Load Balancer Protocol" to "HTTP" and "Instance Protocol" to "HTTP". 
  - Click "Next".
- Step 2: Assign Security Groups
  - Select "Create a new security group".
  - Set rules for __both__ HTTP and HTTPS. If you only do HTTPS, anyone who goes to `http://yourdomain.com` will get an Access Denied message. Allow them to access the site with HTTP, the software will forward them to HTTPS automatically.  
  - Click "Next".
- Step 3: Configure Security Settings
  - If you have an SSL certificate, you can upload that here. Otherwise select "Choose an existing certificate from AWS Certificate Manager (ACM)".
  - If you have not requested a certificate for your domain yet, you will need to click "Request a new certificate from ACM" and follow those instructions before proceeding.
- Step 4: Configure Health Check
  - Ping Protocol: HTTP
  - Ping Port: 80
  - Ping Path: /app/tangerine/index.html
  - Response Timeout: 5 seconds
  - Interval: 10 seconds
  - Unhealthy threshold: 10
  - Healthy threshold: 2
- Step 5: Add EC2 Instances
  - Select the EC2 instance running Tangerine.
- Step 6: Add Tags 
  - No tags are required for Tangerine.
- Step 7: Review
  - If everything looks good, go ahead and create it!
- Now proceed to your Load Balancers dashboard, click on your load balancer, click on the Instances tab, and now wait for your EC2 instance to be listed as "InService". 
- Configure your domain's DNS to point to this load balancer by clicking on the load balancer's Description tab and using the "DNS name" given to configure your Domain's DNS. 

## Login
Once your server is created, login with your key:
```` 
 ssh -i ~/.ssh/iyour_key -l ubuntu <your EC2 instance's IP address>
````

Now you may continue to step 2 in the installation instructions.
