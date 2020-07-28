# Install Docker
apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io
# Copy over config.sh script, prompting for settings and passwords, ensuring password strength.
# Set up Docker Log settings
# Create outage alarm in AWS Cloudwatch 
# Create DNS records in AWS Route 53
# Set up Nginx Reverse Proxy with SSL 
# Configure cron
# Set up backups
# Find latest release of Tangerine and start.

