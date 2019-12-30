# Instruction for releasing a new version of Tangerine

0. Make sure your local master branch is up to date and clean. `git fetch origin && git checkout master && git merge origin/master && git status`.
1. Increment the version number in `package.json` in client and editor if necessary (if any tangy libs were updated or new capabilities added). 
2. Complete an entry in `CHANGELOG.md` for the release.
3. Git commit with a git commit message of the same release number.
4. Git tag with the same name as the release number.
5. Git push the master branch, git push the tag.
6. Draft a new release on Github of the same tag name using that tag. Use the CHANGELOG notes.
7. Release preview with `./release-preview.sh <version number>`
