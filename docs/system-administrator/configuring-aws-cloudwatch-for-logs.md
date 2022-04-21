# Configuring AWS Cloudwatch

## Create CloudWatchAgentServerRole role

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html

Follow the directions in the section marked "To create the IAM role necessary for each server to run the CloudWatch agent" which are summarized here:

### To create the IAM role necessary for each server to run the CloudWatch agent

- Sign in to the AWS Management Console and open the IAM console at https://console.aws.amazon.com/iam/.
- In the navigation pane, choose Roles and then choose Create role. Under Select type of trusted entity, choose AWS service. 
- Immediately under Common use cases, choose EC2,and then choose Next: Permissions.
- In the list of policies, use the search box to find the CloudWatchAgentServerPolicy and select its checkbox. 
- To use Systems Manager to install or configure the CloudWatch agent, select the box next to AmazonSSMManagedInstanceCore. This AWS managed policy enables an instance to use Systems Manager service core functionality. If necessary, use the search box to find the policy. This policy isn't necessary if you start and configure the agent only through the command line.
- Choose Next: Tags. (If needed)
- Choose Next: Review. For Role name, enter a name for your new role, such as CloudWatchAgentServerRole or another name that you prefer.
- Confirm that CloudWatchAgentServerPolicy and optionally AmazonSSMManagedInstanceCore appear next to Policies.
- Choose Create role. The role is now created.

Diregard the directions marked "To create the IAM role for an administrator to write to Parameter Store"

## Attach IAM role CloudWatchAgentServerRole to instance
https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/iam-roles-for-amazon-ec2.html#attach-iam-role

To attach an IAM role to an instance
- Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/.
- In the navigation pane, choose Instances.
- Select the instance, choose Actions, Security, Modify IAM role.
- Select the IAM role to attach to your instance, and choose Save.

## Installing or updating SSM Agent
https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-install-ssm-agent.html

Agent is already installed in Ubuntu Server 16.04, 18.04, and 20.04
- To check status `sudo systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service`
- To start agent `sudo snap start amazon-ssm-agent`

## Download and configure the CloudWatch agent
https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-CloudWatch-Agent-on-EC2-Instance-SSM-first.html

- To download the CloudWatch agent using Systems Manager, Open the Systems Manager console at https://console.aws.amazon.com/systems-manager/.
- In the navigation pane, choose Run Command. -or- If the AWS Systems Manager home page opens, scroll down and choose Explore Run Command.
- Choose Run command. In the Command document list, choose AWS-ConfigureAWSPackage.
- In the Targets area, choose the instance to install the CloudWatch agent on. If you don't see a specific instance, you probably don't have the correct Policy associated with your instance
- In the Action list, choose Install. In the Name field, enter AmazonCloudWatchAgent.
- Keep Version set to latest to install the latest version of the agent.
- Choose Run.
- Optionally, in the Targets and outputs areas, select the button next to an instance name and choose View output. Systems Manager should show that the agent was successfully installed.

## Configure the CloudWatch agent

The agent configuration file is a JSON file that specifies the metrics and logs that the agent is to collect, including custom metrics. You can create it by using the wizard or by creating it yourself from scratch. You could also use the wizard to initially create the configuration file and then modify it manually.

Create and modify the agent configuration file
- You can configure the agent on your AWS EC2 instance. Run the following command: `/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard`
- When the wizard runs, choose to install statsD and CollectD (default is yes),  the 'Advanced' level of metrics. 
- The defaults are usually fine, but decline when it asks "Do you want to monitor any log files?" and also "Do you want to store the config in the SSM parameter store?"
- The configuration file config.json is stored in /opt/aws/amazon-cloudwatch-agent/bin/config.json 

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-cloudwatch-agent-configuration-file.html

## To restart the CloudWatch agent

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-on-EC2-Instance-fleet.html#start-CloudWatch-Agent-EC2-fleet

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json

If you see an error about collectd, install it: `apt install collectd`

https://github.com/awsdocs/amazon-cloudwatch-user-guide/issues/54#issuecomment-696844909

## Modifying the dashboard

### Create a CloudWatch alarm based on a static threshold
https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ConsoleAlarms.html

### Custom namespaces

Go to CloudWatch -> Metrics -> All Metrics and scroll to Custom namespaces to see the CWAgent namespace.

The default namespace for metrics collected by the CloudWatch agent is CWAgent, although you can specify a different namespace when you configure the agent.

List of data collected by CWAgent here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/metrics-collected-by-CloudWatch-agent.html

### SNS Notifications

To create a topic: https://eu-west-1.console.aws.amazon.com/sns/v3/home?region=eu-west-1#/topics


