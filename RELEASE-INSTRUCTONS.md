# Instruction for releasing a new version of Tangerine

0. Make sure your local master branch is up to date and clean. `git fetch origin && git checkout master && git merge origin/master && git status`.
1. Increment the version number in `package.json` in client and editor if necessary (if any tangy libs were updated or new capabilities added). 
2. Complete an entry in `CHANGELOG.md` for the release.
3. Git commit with a git commit message of the same release number.
4. Git tag with the same name as the release number.
5. Git push the master branch, git push the tag.
6. Draft a new release on Github of the same tag name using that tag. Use the CHANGELOG notes.
7. Release preview with `./release-preview.sh <version number>`

# Making a major version release

Once the release candidate (rc) has passed testing, pull the rc image from Docker Hub, tag with the new version, and push to Docker Hub:

```shell script
docker pull tangerine/tangerine:v3.9.0-rc-13
docker tag tangerine/tangerine:v3.9.0-rc-13 tangerine/tangerine:v3.9.0
docker push tangerine/tangerine:v3.9.0
```
We used to trigger a Docker Hub build by tagging the GH repo with the new release tag; however, we've changed our approach. We tag the final rc candidate instead so that we can ensure that the image is identical to the one we tested. We don't want updated dependencies to cause inconsistencies. What we release should be what we tested.

Next, do the following:
1. Merge release branch into master
2. Merge master into next
3. Make release on gh repo. This will create a tag on the GH repo and automatically initiate a build on docker Hub. 
4. Cancel that build; it would overwrite the one already pushed. 
5. Announce on Tangerine teams channel

