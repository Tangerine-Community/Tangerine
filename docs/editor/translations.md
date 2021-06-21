# Translations

There are two types of translations in Tangerine, Application Translations and Content Translations. Applications Translations are translations on Tangerine User Interface such as the "next" button on a form, or the "Sync" menu item in the top level tablet menu. Content Translations are the translations on forms such as the "label" and "hint text" of a question. The method of providing translations are different for the two.

## Content Translations
Translations for specific languages are embedded in content, thus portable and specific to that content. The `<t-lang>` component (https://github.com/ICTatRTI/translation-web-component) is used to detect the language assigned to the HTML doc. In the following example, the label on the `hello` input will be "Hello" if English is set as the language, "Bonjour" if French is selected as the language.

```
	<tangy-input 
		name="hello"
		label="
			<t-lang en>Hello</t-lang>
			<t-lang fr>Bonjour</t-lang>
		"
	>
	</tangy-input>
```

## Application Translations
By default, when you create a new Group in Tangerine, a set of default Application Translations are provided. Currently that includes English, French, Jordanian, Khmer, and Russian. When deploying, these languages are selectable on a per tablet basis under the Tangerine Settings menu.

If you would like to add or modify translations for your group, currently we would recommend setting up your group with a Github Integration to allow editing of the content of your group's content. In your group's content folder you will find two types of files, the list of translations in `translations.json`, and then a file per translation such as `translation.fr.json` for French, `translations.ru.json` for Russian, etc. By adding to, or removing, or modifying entries in `translations.json`, this will modify what translations are available for a tablet user to select in settings. 

See the default `translations.json` file [here](https://github.com/Tangerine-Community/Tangerine/blob/master/client/default-assets/translations.json) and find the other default translation files [here](https://github.com/Tangerine-Community/Tangerine/tree/master/client/default-assets).


