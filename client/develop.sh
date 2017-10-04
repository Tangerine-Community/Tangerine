# kill http-server processes that may have been running.
ps -a | grep 'bin\/http-server' | awk '{print $1}' | xargs kill
# start servers
cd legacy/src
http-server -p 8080 &
cd ../..
cd tangy-forms
http-server -p 8083 &
cd ..
cd content
http-server -p 8082 &
cd ..
cd shell
npm run start 
