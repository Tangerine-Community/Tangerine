
## Release a prerelease  

Prereleases are useful for testing some recently merged code into the next branch.

0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the `next` branch.
2. Set the "Tag version" to the version of the `next` branch is currently targeting and append `-prelease-` and then the number of the prerelease. For example, if the current stable version is v3.10.0, there is a `release/v3.11.0` branch because of feature freeze, then the `next` branch is targeting `v3.12.0`. If this is the first prerelease for `v3.12.0`, then the "Tag version" would be `v3.12.0-prerelease-1`. The second prerelease would be `v3.12.0-prerelease-2`.
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. Publish an alpha release of tangerine-preview by running the following, but replace `<tag name>` with the tag you created: `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-prerelease.sh <tag name>`.


## Release a release candidate

After code freeze, a release branch is made and it's time to start creating some releases for QA. These are technically still "prereleases", just a slightly different intent in that we hope they are stable.

0. Complete an entry in `CHANGELOG.md` for the release.
0. Go to the New Release Page on github (https://github.com/Tangerine-Community/Tangerine/releases/new). 
1. Set "Target" to the release branch branch.
2. Set the "Tag version" to the version this release candidate is targetting with `-rc-` and the number appended. For example, if this was the third release candidate for v3.11.0, the tag would be `v3.11.0-rc-3`. 
3. Leave the "Release title" blank.
4. Check the "This is a pre-release" checkbox.
5. Click "Publish release".
6. `rm -rf tangerine && git clone git@github.com:tangerine-community/tangerine && cd tangerine && ./release-preview-rc.sh <tag name>`.


# Release a stable version 

Once the release candidate (rc) has passed testing, it's time to roll the stable release.

0. Merge release branch into master
0. Migrate changes in `CHANGELOG.md` to `./docs/whats-new.md` in `master`.
0. Merge master into next
0. Make release on gh repo. This will create a tag on the GH repo and automatically initiate a build on docker Hub. 
0. Cancel that build; it would overwrite the one already pushed. 
0. Copy the last rc Docker image to be named after the stable versions (see below). 
0. Annound the release on Teams.

Pull the rc image from Docker Hub, tag with the new version, and push to Docker Hub:
```shell script
docker pull tangerine/tangerine:v3.9.0-rc-13
docker tag tangerine/tangerine:v3.9.0-rc-13 tangerine/tangerine:v3.9.0
docker push tangerine/tangerine:v3.9.0
```

We used to trigger a Docker Hub build by tagging the GH repo with the new release tag; however, we've changed our approach. We tag the final rc candidate instead so that we can ensure that the image is identical to the one we tested. We don't want updated dependencies to cause inconsistencies. What we release should be what we tested.
