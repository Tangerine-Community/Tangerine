if [ ! -d "min" ]; then
  mkdir min
else
  rm min/*
fi

coffee -bc `find . -name "*.coffee"`

rm lib.js app.js
./uglify.rb `find ./modules -name "*.js"`
./uglify.rb `ls *.js`
./uglify.rb lib
./uglify.rb app

coffee -bc `find ../../views -name "*.coffee"`
coffee -bc `find ../../lists -name "*.coffee"`
coffee -bc `find ../../shows -name "*.coffee"`
