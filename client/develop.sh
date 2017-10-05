# kill http-server processes that may have been running.
ps -a | grep 'bin\/http-server' | awk '{print $1}' | xargs kill
# start servers
cd legacy/src
http-server -c-1 -p 8080 &
cd ../..
cd tangy-forms
http-server -c-1 -p 8081 &
cd ..
cd content
http-server -c-1 -p 8082 &
cd ..
cd shell
npm run start 
