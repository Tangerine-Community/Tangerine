# Installing Tangerine on AWS

## Creating the AWS instance
Login to AWS and Launch a new instance with Ubuntu 18.04 using a t2.medium server with 4 GiB memory. 

Volume should be larger than the 8GB default. 24GB would be useful, but if you're planning to test different Tangerine images, go for 64GB.

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


## SSH Login to Server
Once your server is created, login with your key:
```` 
 ssh -i ~/.ssh/iyour_key -l ubuntu <your EC2 instance's IP address>
````

Now you may continue to step 2 in the installation instructions of Tangerine's README.md, then pick back up here.


## Configure Logs
Send logs to AWS CloudWatch for building alarms and saving disk space.

1. Create IAM user with programattic access and AWSAppSyncPushToCloudWatchLogs policy. Keep open credentials screen for reference.
2. Install aws-cli with `sudo apt-get install awscli`.
3. `aws configure` and give the credentials for the IAM user.
4. Go to `AWS Console -> IAM -> Access Management -> Roles -> Create Role`, create a role called `aws-cloudwatch-logs` with an attached policy of `AWSOpsWorksCloudWatchLogs`. 
5. Go to `AWS Console -> EC2 -> Instances -> <select your instance> -> Actions -> Security -> Modify IAM role` and add the `aws-cloudwatch-logs` role to the EC2 instance.
6. Go to `AWS Console -> CloudWatch -> Logs -> Actions -> Create log group`.
7. Create the Log Group named after the instance name (ie. example-v3). 
8. Write the configuration to `/etc/docker/daemon.json`. Change `awslogs-region` to the "less specific" region name (eu-central-1 as opposed to eu-central-1b) and replace `example-v3` in `tag` and `awslogs-group` to reflect the EC2 instance name. 
9. Then run `systemctl restart docker`. If containers were already running, you may need to recreate them for settings to take hold. For Tangerine, that just means running `./start.sh` again.
10. After setting up Tangerine, navigate in your browser to `AWS Console -> CloudWatch -> Logs` and select your instance's log group. There you will find two streams, one for the tangerine container the other for couchdb container using the "tag" pattern you configured in `daemon.json`.

```
{
	"log-driver": "awslogs",
	"log-opts": {
		"awslogs-region": "eu-central-1",
		"awslogs-group": "example-",
		"tag": "example-{{.Name}}"
	}
}
```


## Configure Alarm
With Docker logs being sent to AWS CloudWatch, you can configure an alarm to detect if Tangerine is down. The following directions explain how to send an automated email if a Tangerine heartbeat log message is not heard for 15 minutes. 

- Navigate in your browser to `AWS Console -> CloudWatch -> Logs`.
- Open your server's log group.
- Open the stream for Tangerine. If your tag pattern in `/etc/docker/daemon.json` is `example-{{.Name}}`, then your stream name will be `example-tangerine`.
- In the `Filter events` text box, type `heartbeat` and press enter. This will filter the logs to all heartbeat messages.
- With the filter still applied, click the "Create Metric Filter" button.
- Fill out "Metric" form as follows:
    - Filter name: heartbeat
    - Filter pattern: heartbeat
    - Metric namespace: tangerine
    - Metric name: heartbeat
    - Metric value: 1
    - Default value: 0
    - Unit: _leave blank_
- Fill out "Notification" form as follows:
    - Alarm state trigger: In alarm
    - Select an SNS topic: Create new topic
    - Create a new topic...: `<server name>-tangerine-heartbeat`
    - Email endpoints that will receive the notification...: `<your email address>`
- Click "Create Topic" button, then "Next" button.
- Fill out "Name and description" form as follows then click "Next" button:
    - Alarm name: `<server name>-tangerine-heartbeat`
- Now on the "Preview and create" screen, click "Create Alarm"
- Check your email to confirm subscription to SNS Topic.
