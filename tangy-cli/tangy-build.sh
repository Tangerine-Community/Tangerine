#!/bin/bash
CLI_DIR=$1
SOURCE_DIR=$PWD
APP_DIR="$SOURCE_DIR/code/src/app"
DIST_DIR="$SOURCE_DIR/code/dist"

# Clean up.
rm -r public
rm -r code

# Create the new app.
ng new --routing code 

# Get all MD file paths.
index=0
for x in `find ./ * | grep -v "code\/" | grep -v "\.\/\/" | grep ".md"`; do
    MD_PATHS[$index]="$x"
    index=$(($index+1))
done 

# Convert them all to HTML
index=0
for MD_PATH in "${MD_PATHS[@]}"
do
  :
  HTML_PATH=`echo $MD_PATH | sed -e 's/.md/.html/'` 
  HTML_PATHS[$index]="$HTML_PATH"
	echo "Transpiling Markdown at $MD_PATH to HTML at $HTML_PATH"
  ## TODO: Transpile anchor tags into NG Router links.
  cat "$MD_PATH" | mdown > "$HTML_PATH"
	index=$(($index+1))
done

# Use index.html to override app.component.html
rm "$APP_DIR/app.component.html"
cp "$SOURCE_DIR/index.html" "$APP_DIR/app.component.html"

# Generate a Module, Component, and Route for each HTML file.
index=0
for HTML_PATH in "${HTML_PATHS[@]}"
do
  :
  cd "$APP_DIR"
  FS_NAME=`echo $HTML_PATH | sed -e 's/.html//' | sed -e 's/\//--/'`
  MODULE_PATH="$APP_DIR/$FS_NAME"
  MD_PATH=${MD_PATHS[$index]}
  ESCAPED_MD_PATH=`echo "$MD_PATH" | sed -e ''`
  echo "Installing module: $FS_NAME to $MODULE_PATH"
  ng generate module --routing $FS_NAME
  MODULE_NAME=`cat "$APP_DIR/$FS_NAME/$FS_NAME.module.ts" | tail -n 1 | awk '{print $3}'`
  COMPONENT_NAME=`echo "$MODULE_NAME" | sed -e "s/Module/Component/"`
  # ES6 import module into app.module.ts.
  echo "import { $MODULE_NAME } from './$FS_NAME/$FS_NAME.module';" > tmp
  cat "$APP_DIR/app.module.ts" >> tmp
  mv tmp "$APP_DIR/app.module.ts"
  # Angular import the module into the AppModule.
  cat "$APP_DIR/app.module.ts" | sed -e "s/imports\: [\[]/imports\: [ $MODULE_NAME,/" > "$APP_DIR/app.module.ts"
  # Generate component.
  cd "$MODULE_PATH" 
  ng generate component $FS_NAME;
  # Move HTML file to Component.
  cd $SOURCE_DIR 
  mv "$HTML_PATH" "$MODULE_PATH/$FS_NAME/$FS_NAME.component.html"
  # Edit routing to ES6 import Component.
  echo "import { $COMPONENT_NAME } from './$FS_NAME/$FS_NAME.component';" > tmp
  cat "$MODULE_PATH/$FS_NAME-routing.module.ts" >> tmp
  mv tmp "$MODULE_PATH/$FS_NAME-routing.module.ts"
  # Edit routing to declare route or Component.
  echo "MD_PATH IS $MD_PATH"
  cat "$MODULE_PATH/$FS_NAME-routing.module.ts" | sed -e "s#const routes# const routes \: Routes \ = \[ \{ path\: '$MD_PATH', component\: $COMPONENT_NAME \}\] \/\/#" > tmp
  mv tmp "$MODULE_PATH/$FS_NAME-routing.module.ts"
	index=$(($index+1))
done

# Build the Angular App.
cd "$SOURCE_DIR/code" 
ng build
# Move the dist directory to home.
cd ..
mv ./code/dist ./public
# Cleanup
# rm -rf code
# Start the server.
cd public
hs
