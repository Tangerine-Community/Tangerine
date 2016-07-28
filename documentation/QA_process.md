# Tangerine QA Process

Setup your own AWS instance using the instructions on INSTALLATION_AWS.md.

Fix bugs on a branch separate from master. Check if the build is successful 
for the branch on https://hub.docker.com/r/tangerine/

# Helpful tools

On your AWS instance, install the following tools to import assessments for testing:

````
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
also - install Tangerline-CLI
git clone https://github.com/Tangerine-Community/Tangerine-CLI.git
cd Tangerine-CLI
npm link
````

# Verifying your build

Assuming you observed the instructions in INSTALLATION_AWS.md and have 
already built Tangerine from that source, you may only need to update config.sh 
to point to the correct ip address in case your AWS instance was stopped.

    T_HOST_NAME='1.2.3.4'
    
Populate your env - you may need to adjust the path to Tangerine

    source /home/ubuntu/Tangerine-0.3.0/config.sh
    
Delete any old/running tangerine-container instances

    docker rm -f tangerine-container
    
Why not clear out any dangling images too:

    docker volume ls -qf dangling=true | xargs -r docker volume rm
    
 Change the docker instance name  your docker instance to your fork 
 (tangerine:1234-bugfix) and run your instance.
    
    ````
    docker run -d   --name tangerine-container   --env "T_PROTOCOL=$T_PROTOCOL"   
    --env "T_ADMIN=$T_ADMIN"   --env "T_PASS=$T_PASS"   --env "T_USER1=$T_USER1"   
    --env "T_USER1_PASSWORD=$T_USER1_PASSWORD"   --env "T_TREE_HOSTNAME=$T_TREE_HOSTNAME"   
    --env "T_TREE_URL=$T_TREE_URL"   --env "T_HOST_NAME=$T_HOST_NAME"   -p 80:80   -p 5984:5984  
    --volume $T_VOLUMES/tangerine/couchdb/:/var/lib/couchdb   tangerine/tangerine:1234-bugfix
    ````

Follow the steps for [Copying Assessments across TSI's](https://github.com/ICTatRTI/Tangerine-Team/blob/master/copying-assessments-across-TSIs.md)