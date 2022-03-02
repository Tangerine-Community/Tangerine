


## Issues

Please use the following issue template links for filing issues. There are links to create issues using the template. To modify the issue template links, replace the `body` and `title` link attributes in the URL with text that has been encoded using [http://urldecode.org](http://urldecode.org).

### User story
[Click here to file a user story](https://github.com/tangerine-community/tangerine/issues/new?title=As+a+%5brole%5d+I+want+to+%5baction%5d+in+order+to+%5bobjective%5d&labels=user%20story&body=%23%23+Tasks%0d%0a*+%5b+%5d+Code%0d%0a*+%5b+%5d+Unit+tests%0d%0a*+%5b+%5d+Documentation%0d%0a*+%5b+%5d+Integration+Tests%0d%0a%0d%0a%23%23+Acceptance+criteria%0d%0a-+...)

Title:
```
As a [role] I want to [action] in order to [objective]
```

Body:
```
## Tasks
* [ ] Code
* [ ] Unit tests
* [ ] Documentation
* [ ] Integration Tests

## Acceptance criteria
- ...
```

### Bug
[Click here to file a bug](https://github.com/tangerine-community/tangerine/issues/new?title=I+expected+%5bexpected+behavior%5d+but+I+get+%5bactual+behavior%5d&labels=bug&body=Current+version%3a%0d%0aUpgraded+from%3a%0d%0aIssue+on+tablet+and%2for+server%3a%0d%0a%0d%0a%23%23+Expected+behavior%0d%0a%0d%0a%23%23+Actual+behavior%0d%0a%0d%0a%23%23+Steps+to+reproduce+the+behavior%0d%0a)

Title:
```
I expected [expected behavior] but I get [actual behavior]
```

Body:
```
Current version:
Upgraded from:
Issue on tablet and/or server:

## Expected behavior

## Actual behavior

## Steps to reproduce the behavior
```


### Technical issue
[Click here to file a technical issue](https://github.com/tangerine-community/tangerine/issues/new?labels=technical&body=)

There is no template for this one but make sure to add the `technical` label. 



## Release Workflow
- Maintainer prepares for a new version by creating a Milestone and adding a place for the release in the `CHANGELOG.md` in the `develop` branch.
- Issues are assigned to the Milestone. 
- When you are assigned an issue, create a branch based on the `develop` branch named after the issue number and description, something like `1325-fix-some-bug`. Put the PR in the milestone, link to the corresponding issue from the PR and mark issue as "in progress".
- As time progresses while developing your feature, keep your code up-to-date with changes in the next and (after feature freeze) release/v-feature-number branches. The [Gitflow docs](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) explain this process in greater detail. 
  
  Git commands to keep your branch in-sync:
  ```shell script
    git fetch origin
    git merge origin/release/v3.x.x # (if currently in feature freeze)
    git merge origin/develop  
  ```
- When your PR is ready, add notes to the `CHANGELOG.md` file in your branch and request a review.
- After code review, if code is merged, the Maintainer will tag the next branch with a prerelease tag and mark corresponding issue with "review" tag for QA.
