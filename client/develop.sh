cd legacy/src
http-server -p 8080 &
cd ../..
cd tangy-forms
http-server -p 8081 &
cd ..
cd content
http-server -p 8082 &
cd ..
cd shell
npm run start 
