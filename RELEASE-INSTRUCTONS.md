
## Release a prerelease  

Prereleases are useful for testing some recently merged code into the next branch.

0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the `next` branch.
2. Set the "Tag version" to the version of the `next` branch is currently targeting and append `-prelease-` and then the number of the prerelease. For example, if the current stable version is v3.10.0, there is a `release/v3.11.0` branch because of feature freeze, then the `next` branch is targeting `v3.12.0`. If this is the first prerelease for `v3.12.0`, then the "Tag version" would be `v3.12.0-prerelease-1`. The second prerelease would be `v3.12.0-prerelease-2`.
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. Publish an alpha release of tangerine-preview by running the following, but replace `<tag name>` with the tag you created: `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-prerelease.sh <tag name>`.
7. Cancel the Build Docs action!


## Release a release candidate

After code freeze, a release branch is made and it's time to start creating some releases for QA. These are technically still "prereleases", just a slightly different intent in that we hope they are stable.

0. Merge master into the release branch in case there have been any other releases that have added code to master.
0. Complete an entry in `CHANGELOG.md` for the release.
0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the release branch branch.
2. Set the "Tag version" to the version this release candidate is targetting with `-rc-` and the number appended. For example, if this was the third release candidate for v3.11.0, the tag would be `v3.11.0-rc-3`. 
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-rc.sh <tag name>`.
7. Cancel the Build Docs action!

## Release a stable version 

Once the release candidate (rc) has passed testing, it's time to roll the stable release.

0. Try to merge master into the release branch. If commits are merged, then there may be released code that is missing from the RC that passed QA. Stop this release and tag a new RC for QA. 
1. Merge release branch into master. Github actions will automatically create a PR and merge master into next.
2. Checkout the release candidate tag and tag that commit with a stable version. ie. `git checkout v3.15.0-rc-21 && git tag v3.15.0 && git push origin v3.15.0`
3. Pull the RC image, rename it, and push it. ie. `docker pull tangerine/tangerine:v3.15.0-rc-21 && docker tag tangerine/tangerine:v3.15.0-rc-21 tangerine/tangerine:v3.15.0 && docker push tangerine/tangerine:v3.15.0`
4. Make release on Github using the same tag pushed up to Github. Link to the appropriate release on ["What's New" page on docs.tangerinecentral.org](https://docs.tangerinecentral.org/whats-new/). Copy the release notes from the CHANGELOG to this release.
5. Cancel the build in GitHub Actions for this tag.
7. Cancel the Build Docs action if this is a patch release (hotfix)! Otherwise old docs will override the current ones.
9. Announce on Teams we have a new release.
