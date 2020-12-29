cd data/groups && ls -l | awk '{print $9}' | xargs -i sh -c 'cd {} && git init && cd ..'
