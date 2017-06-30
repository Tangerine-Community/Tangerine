#!/bin/bash
CLI_DIR=$1
SOURCE_DIR=$PWD
APP_DIR="$SOURCE_DIR/code/src/app"
DIST_DIR="$SOURCE_DIR/code/dist"

if [ ! -d "./app" ]; then
  ng new code 
fi
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

# Generate a Module, Component, and Route for each HTML file.
cd "$APP_DIR"
for HTML_PATH in "${HTML_PATHS[@]}"
do
  :
  # TODO: Special case if index. Modify app.* files instead.
  FS_NAME=`echo $HTML_PATH | sed -e 's/.html//' | sed -e 's/\//--/'`
  MODULE_PATH="$APP_DIR/$FS_NAME"
  echo "Installing module: $FS_NAME to $MODULE_PATH"
  ng generate module $FS_NAME
  MODULE_NAME=`cat "$APP_DIR/$FS_NAME/$FS_NAME.module.ts" | tail -n 1 | awk '{print $3}'`
  # ES6 import module into app.module.ts.
  echo "import { $MODULE_NAME } from './$FS_NAME/$FS_NAME.module';" > tmp
  cat "$APP_DIR/app.module.ts" >> tmp
  mv tmp "$APP_DIR/app.module.ts"
  # Angular import the module into the AppModule.
  cat "$APP_DIR/app.module.ts" | sed -e "s/imports\: [\[]/imports\: [ $MODULE_NAME,/" > "$APP_DIR/app.module.ts"
  # Generate component.
  # Move HTML file to Component.
  # Edit routing to import and declare path for Component.
  
done
