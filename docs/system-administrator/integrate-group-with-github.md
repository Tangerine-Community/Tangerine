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
ssh-keygen -t rsa -b 4096 -C "root@domain_of_server"
cat /root/.ssh/id_rsa.pub
```

Change the key permissions if necessary.

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
crontab -e
```
Enter the following onto a new line. Replace `<group id>` with appropriate Group ID.
```
* * * * * cd /home/ubuntu/tangerine/data/client/content/groups/<group id> && git add . && git commit -m 'auto-commit' && GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa' git pull origin master && GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa' git push origin master
```
