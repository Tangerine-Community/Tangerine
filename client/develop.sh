# start servers
cd tangy-forms
../node_modules/.bin/http-server -c-1 -p 8084 &
cd ..
cd content
../node_modules/.bin/http-server -c-1 -p 8082 &
cd ..
cd shell
npm run start  
