# Instruction for releasing a new version of Tangy Form Editor

0. Merge all changes into master branch.
0. If any of your dependencies changed - such as tangy-form - run `npm install` to generate an updated package-lock.json. 
0. Ensure `CHANGELOG.md` is complete.
0. Run `npm version major`, `npm version minor`, or `npm version patch` depending on what kind of version change this is. This command will make a commit and tag named after the incremented version.
0. `git push origin master && git push origin --tag` 
0. Draft a new release on Github of the same tag name using that tag. Use the CHANGELOG notes.
0. Ensure the github action successfully built and published the npm package.
