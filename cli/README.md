# Tangerine-CLI

This CLI provides an interface to some useful utitilies for Tangerine. 

## Install
```
git clone https://github.com/Tangerine-Community/Tangerine-CLI.git
cd Tangerine-CLI
npm link
tangerine --help
```

## Usage
`tangerine help` will list the sub-commands available in the `tangerine` command. Running `tangerine <sub-command> --help` willl explain that sub-command's options.
```
tangerine push-backup --help
tangerine pull-assessments --help
```

## Examples
Pull down assessments from one group and push them to another.

  mkdir data
  tangerine pull-assessments --url http://username:password@databases.tangerinecentral.org/group-avonlea_ph_pilot_qnrs > ./data/assessments.json
  tangerine push-backup --url https://username:password@rti.tangerinecentral.org/db/group-some-group --path ./data/

