# How to Contribute Documentation

Documentation in Tangerine is managed using the same process as all code contributions. In short, all changes should be completed within a feature-branch or fork of Tangerine and submitted as a pull request to the "next" branch. 

## Documentation Overview

Tangerine documentation is written using Markdown as the standard source. Documentation is compiled using MkDocs and is available within GitHub Pages and at Readthedocs.org. Links are as follows:

 * GitHub Pages: [https://docs.tangerinecentral.org/](https://docs.tangerinecentral.org/#!index.md)
 * Readthedocs.org: [https://tangerine.readthedocs.io/](https://tangerine.readthedocs.io/) 
 
## Documentation Standards

All documentation must be created and published using Markdown (.md) files and must reside in the `docs/` folder or a subdirectory of the `docs` folder. 

### Adding your Document to the Navigation

Please follow the instructions on the [MkDocs Documentation](https://www.mkdocs.org/#adding-pages) for adding pages to the navigation. The `mkdocs.yml` file can be found at the root level of the Tangerine repository.

```YAML
...
nav:
    - Home: index.md
    - About: about.md
...
```

## Setting up your Environment for Local Documentation Development

Since Tangerine documentation is written in Markdown it's not necessary to have a full local development environment setup to add or modify documentation. That said, if you're making significant changes you may desire to have the ability to build the documentation locally. 

If you do want to setup a local development environment, I would recommend following [MkDocs Installation Instructions](https://www.mkdocs.org/#installation) and starting your local environment with the `mkdocs serve` command.

## Contribution Guide
TODO: Replace this video with an updated version to reflect the new process
<iframe width="560" height="315" src="https://www.youtube.com/embed/EyQz44EvdZI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


