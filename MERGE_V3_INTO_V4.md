# Merging changes from v3 into v4

This is the current process used to merge changes from v3 into v4. It involves the following steps:

1. Create a new branch from the v4 branch:
   ```bash
   git checkout -b merge-v3-into-v4
   ```
2. Merge the v3 branch into the new branch:
   ```bash
   git merge v3
   ```
3. Resolve any merge conflicts that arise. This may involve manually editing files to ensure that the changes from both branches are correctly integrated.
  - Changes to most Angular component files will merge automatically, but some files may require manual resolution.
  - Watch out for changes to the `package.json` file. Most of the time you will want to keep the "current change" aka the v4 change. However, if the v3 change is a new dependency that is not in v4, you will want to keep the v3 change.
4. Once all conflicts are resolved, commit the changes:
   ```bash
   git add .
   git commit -m "Merged changes from v3 into v4"
   ```
4. Next, use the [script](./scripts/manual-tangy-form-merge.sh) to manually copy files from `tangy-form` and `tangy-form-editor`. Those repos are no longer separate components. They live as files in this repo. The script copy in files that changed since the provided tag.
   ```bash
    ./scripts/manual-tangy-form-merge.sh <tangy-form-or-tangy-form-editor> <tag>
    ```
5. Check the files copied in are correct, then commit the changes.
5. Push the new branch to the remote repository:
   ```bash
   git push origin merge-v3-into-v4
   ```
6. Create a pull request from the new branch to the v4 branch in the remote repository.
7. Review the pull request and ensure that all changes are correct and that there are no remaining merge conflicts.