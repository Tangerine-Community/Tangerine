## Creating Clean Development Content

If you are trying to fix an issue, it is helpful to begin development using content that is known to support common Tangerine features. This can be more reliable than using a project's content because that content may have missing forms that create bugs that have nothing to do with the issue you are trying to resolve. 

The `create-group` command to the rescue!

The following command downloads a content set known to support common Tangerine features and is used for load-testing. Notice that it is a github repo; therefore, you may clone it and modify at will. 

`docker exec tangerine create-group "New Group C" https://github.com/rjsteinert/tangerine-content-set-test.git`

There is also support for creating a group using local content from the `content-sets` directory' in the Tangerine repository. Currently, there is support for creating a case-module:

`docker exec tangerine create-group "New Group D" case-module`

You may also configure how inputs are populated by custom functions; see the Case generation section in the [Load testing doc](load-testing.md).

If you add `--help` to the `create-group` command you may see other options as well.

`docker exec tangerine create-group --help`

To see more examples, check out the [demo video](https://youtu.be/dGo4C90aAto) from the v3.10.0 release.
