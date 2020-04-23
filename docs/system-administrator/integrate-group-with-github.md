# Integrate a group's content with a repository on Github 

## Step 1
Create a group in the Editor. Note the ID in the URL starting with `group-`.

## Step 2
Create a repository on Github for your group's content.

## Step 3
SSH into the server and create a "deploy key" the server will use to authenticate to Github with. When running `ssh-keygen`, do not password protect the key file. When it prompts you for a password, just hit enter.

```
ssh <your server>
sudo su
ssh-keygen -t rsa -b 4096 -C "your_server_name@domain_of_server"
cat /root/.ssh/id_rsa.pub
```
Copy the key contents that we just "cat'ed" to the screen. Then go to your Repository on Github and click on `Settings -> Deploy keys -> Add deploy key` and paste that key in the key contents, enable "Allow write access" and save.

## Step 4
Now we push our group's initial content to our github repository with the following commands...

```
cd tangerine/data/client/content/groups/<group id>
git init
git add .
git commit -m "first commit"
git remote add origin <githut repository SSH URL>
git push origin master
```

You should now see on your Github Repository code page a list of files pushed from the server.

## Step 5
We'll now configure your server to periodically pull content changes from Github.

```
ssh <your server>
sudo su
screen -R git-integration
cd tangerine/data/client/content/groups/<group id>
watch -n10 "GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa' git pull origin master && git add . && git commit -m 'auto-commit' && GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa' git push origin master
```

At this point you have created "virtual screen session" called "git-integration" that is using the `watch` command to run the `git pull` command every 10 seconds. You'll want to leave this screen session open after your terminal disconnects. To "detach" from a screen session but leave it running in the background, press `ctrl-a` `ctrl-d`. Now you can safely log out from your SSH session while the screen session continutes. 

```
ssh <server>
sudo su
# List the screen sessions to get the git-pull-worker screen session ID to join.
screen -ls
# Join the screen session.
screen -R <screen session ID, something like 29134.git-integration>
```
