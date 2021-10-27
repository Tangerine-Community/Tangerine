# i18n/Translation

In Tangerine there are two kinds of translations, content translations and application translations. Content translations are embedded in form content by Editor Users using `<t-lang>` tags, while application translations are embedded in application level code using the `t` function in Web Components, `_TRANSLATE` function in an Angular TS file, or `translate` pipe in Angular component templates.

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
In application code, instead of placing inline translations, a centrally managed JSON file is sourced for replacing strings. At `./translations/translation.fr.json` you will find the JSON file use for translations when the French language is selected.

```
{
	"Accuracy": "Précision",
	"Accuracy Level": "Niveau de précision",
	"Add New User": "Ajouter un nouvel utilisateur",
	"Add User to Group": "Ajouter un utilisateur à un groupe",
	...
}
```

You'll also find the Russian translation at `./translations/translation.ru.json`.
```
{
	"Accuracy": "Аккуратность",
	"Accuracy Level": "Уровень аккуратности",
	"Add New User": "Добавить нового пользователя",
	"Add User to Group": "Add User to Group",
	...
}
```

And many more. Each file defines an object where the keys are what to replace in the application and the values are what to replace strings with for that language. Depending on where in the application the string is, there are different techniques for exposing a string to translation.

In Web Components libraries such as `<tangy-form>` and `<tangy-form-editor>`, they use a special `t` function. Translating strings in template literals looks like...

```
this.shadowRoot.innerHTML = `
  <h1>
    ${t('Hello')}
  </h1>
  ...
`
```

Often times Polymer templates are used which won't let you embed functions. In that case, in `connectedCallback` a `this.t` object is assembled and then used in the Polymer template.

```
	connectedCallback() {
		super.connectedCallback()
		this.t = {
			hello: t("Hello")
		}
	}
	template() {
		return html`
			[[t.hello]]	
		`
	}
```


In Angular Components, the `translate` pipe is available in templates and _TRANSLATE function for translating in TS files outside of templates.


```
<h1>
	{{'Hello'|translate}}
</h1>
```

```
	const helloString = _TRANSLATE('Hello')
```

### Application Translation Workflow 
1. Add new translatable string(s) to `./translations/translation.en.json`.
2. With develop.sh running, run `docker exec tangerine make-translations-consistent` to spread this translateable to the other translation json files. 
3. With develop.sh running, run `docker exec tangerine export-translations-csvs` to spread this translateable to the other translation csv files. 
4. Commit changes to the translations folder.
5. Send the translations CSVs to corresponding translator.
6. When all translation CSVs have been updated, with develop.sh running, run `docker exec tangerine import-translations-csvs` to convert translation CSVs to JSON files.
7. Add instructions to CHANGELOG upgrade notes that `docker exec tangerine translations-update` will need to be run to update all groups with updated translation files.


## Other notes
Mat-pagination needs a special service to enable use of translation.json - see class/_services/mat-pagination-intl.service.ts

## Right to left languages (RTL)

Mat-menu does not support RTL out of the box, but it's simple to get it working: add `dir="rtl"` to its enclosing element.

```
<span dir="rtl">&nbsp;&nbsp;&nbsp;
  <button mat-button [matMenuTriggerFor]="reportsMenu" class="mat-button">{{'Select Report'|translate}}</button>
  <mat-menu #reportsMenu="matMenu">
    <button mat-menu-item [matMenuTriggerFor]="groupingMenu">Class grouping</button>
  </mat-menu>
  <mat-menu #groupingMenu="matMenu">
    <button mat-menu-item *ngFor="let item of formList" routerLink="/reports/{{item.id}}/{{item.classId}}">{{item.title}}</button>
  </mat-menu>
</span>
```

mat-table also needs some twekas to work - Css:

```

.mat-column-Name {
  padding-right:5px;
}

th.mat-header-cell {
  text-align: right;
}
```
