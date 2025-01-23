## v4 Release Instructions

### Release a prerelease  

Prereleases are useful for testing some recently merged code into the develop branch.

0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the `develop-v4` branch.
2. Set the "Tag version" to the version of the `develop-v4` branch is currently targeting and append `-prelease-` and then the number of the prerelease. For example, if the current stable version is v4.10.0, there is a `release/v4.11.0` branch because of feature freeze, then the `develop` branch is targeting `v4.12.0`. If this is the first prerelease for `v4.12.0`, then the "Tag version" would be `v4.12.0-prerelease-1`. The second prerelease would be `v4.12.0-prerelease-2`.
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. Publish an alpha release of tangerine-preview by running the following, but replace `<tag name>` with the tag you created: `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-prerelease.sh <tag name>`.
7. Cancel the Build Docs action!


### Release a release candidate

After code freeze, a release branch is made and it's time to start creating some releases for QA. These are technically still "prereleases", just a slightly different intent in that we hope they are stable.

0. Merge `main-v4` into the release branch in case there have been any other releases that have added code to `main-v4`.
0. Complete an entry in `CHANGELOG.md` for the release.
0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the release branch branch.
2. Set the "Tag version" to the version this release candidate is targetting with `-rc-` and the number appended. For example, if this was the third release candidate for v4.11.0, the tag would be `v4.11.0-rc-3`. 
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-rc.sh <tag name>`.
7. Cancel the Build Docs action!

### Release a stable version 

Once the release candidate (rc) has passed testing, it's time to roll the stable release.

0. Try to merge `main-v4` into the release branch. If commits are merged, then there may be released code that is missing from the RC that passed QA. Stop this release and tag a new RC for QA. 
1. Merge release branch into `main-v4`. Github actions will automatically create a PR and merge `main-v4` into develop.
2. Checkout the release candidate tag and tag that commit with a stable version. ie. `git checkout v4.15.0-rc-21 && git tag v4.15.0 && git push origin v4.15.0`
3. Pull the RC image, rename it, and push it. ie. `docker pull tangerine/tangerine:v4.15.0-rc-21 && docker tag tangerine/tangerine:v4.15.0-rc-21 tangerine/tangerine:v4.15.0 && docker push tangerine/tangerine:v4.15.0`
4. Make release on Github using the same tag pushed up to Github. Link to the appropriate release on ["What's New" page on docs.tangerinecentral.org](https://docs.tangerinecentral.org/whats-new/). Copy the release notes from the CHANGELOG to this release.
5. Cancel the build in GitHub Actions for this tag.
7. Cancel the Build Docs action if this is a patch release (hotfix)! Otherwise old docs will override the current ones.
8. Verify that tangerine-preview has successfully published. You may want to install it and try it on a content set to spot check it.
9. Announce on Teams we have a new release.

### Hotfixing a past minor release
When we want to create a release for an existing minor release, we create a hotfix branch. There is a blind spot on the Git Flow documentation where it assumes you would always create a hotfix branch from the `main-v4` because you would never hotfix older versions of your software. Because we do hotfix past minor/major releases, to create a hotfix branch we branch from the last stable tag on that major/minor version. 

1. Create a hotfix branch by checking out the minor version tag and then create the branch. `git checkout v4.18.7; git checkout -b hotfix/v4.18.8;`
2. Proceed as usual tagging release candidates on the hotfix branch and when the release candidate has passed QA, that release candidate becomes an official release.
3. Now we need to get these fixes into the current release. If there is currently a release branch for a minor version being worked on, merge this hotfix branch into the release branch and tag another RC for that release. If there is not currently a release branch being worked on, create a new hotfix branch from `main-v4` and proceed to QA and follow the usual Git Flow workflow.
