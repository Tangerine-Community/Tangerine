# Password Policy

The default password policy is in config.defaults.sh. Although you can change it, it is recommended that you have a strong password policy. 

Relevant variables:
- T_PASSWORD_POLICY - The policy, codedin the form of a regular expression.
- T_PASSWORD_RECIPE - Description of the policy, to enable user to create a password that will pass the policy. 

Ideally a password policy should include the following specifications:
- 8 characters or more
- at least one upper case letters
- at least one lower case letter
- at least one special character
- at least one numeral

Each group can have a unique password policy. When a group is created, the default policy and recipe from config.sh are copied over to the passwordPolicy and passwordRecipe variables in app-config.json.

Editor on the server uses the T_PASSWORD_POLICY and T_PASSWORD_RECIPE variables.

## Tips

If the server's shell has problems interpreting any of the special characters when loading T_PASSWORD_POLICY from config.sh, you may need to add an escape `\` before the special character.

The site https://www.regextester.com/ has been very helpful in testing out password policies. 

