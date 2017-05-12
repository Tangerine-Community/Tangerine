# Tangerine QA Process


## Set up QA server

1. Verify what you want to test has been built on Docker Hub at https://hub.docker.com/r/tangerine/. 
2. Setup an AWS EC2 instance using the instructions on INSTALLATION_AWS.md. When creating your `config.sh` file, make sure to set `T_TANGERINE_VERSION` to the Tangerine Image Tag you want to test. 
3. Now create a group through the editor app in the browser and load up some assessments with `docker exec tangerine-container tangerine push-backup --path /tangerine-server/client/test/packs --url http://user1:password@127.0.0.1:5984/group-g1`. Need other specific assessments? Follow the steps for [Copying Assessments across TSIs](https://github.com/ICTatRTI/Tangerine-Team/blob/master/copying-assessments-across-TSIs.md).
4. Alert your QA testers that the server is now ready, make sure to send them credentials of the first user.

Tip: If you are doing QA on an updated clone of a server, make sure to modify the `settings` document for each group to point to the URL of your new server. 


## Helpful commands    

Delete any old/running tangerine-container instances

    docker rm -f tangerine-container
    
Why not clear out any dangling images too:

    docker volume ls -qf dangling=true | xargs -r docker volume rm

See commands for migrating content and results [here](migrating-results-and-content.md).
