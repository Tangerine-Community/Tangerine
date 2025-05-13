# Password Policy

The default password policy is in config.defaults.sh. Although you can change it, it is recommended that you have a strong password policy. 

Relevant variables:
- T_PASSWORD_POLICY - The policy, coded in the form of a regular expression.
- T_PASSWORD_RECIPE - Description of the policy, to enable user to create a password that will pass the policy. 

Ideally a password policy should include the following specifications:
- 8 characters or more
- at least one upper case letters
- at least one lower case letter
- at least one special character
- at least one numeral

Each group can have a unique password policy. When a group is created, the default policy and recipe from config.sh are copied over to the passwordPolicy and passwordRecipe variables in app-config.json.

For some groups, it may be more useful to have a simpler password policy on client than on editor. Here is an example:

- "passwordPolicy": "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
- "passwordRecipe": "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters",

Editor on the server uses the T_PASSWORD_POLICY and T_PASSWORD_RECIPE variables.

## Tips

If the server's shell has problems interpreting any of the special characters when loading T_PASSWORD_POLICY from config.sh, you may need to add an escape `\` before the special character.

The site https://www.regextester.com/ has been very helpful in testing out password policies. 

