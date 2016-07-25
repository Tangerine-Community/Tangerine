# Developing Tangerine

## Creating new types of Assessments

- Base your new type of Assessment off the following classes:
-- Assessment
-- AssessmentsView
-- AssessmensListItemView

You can use LessonPlan as an example of an Assessment based on Assessment

Add any new prototypes to _docs/templates.json:

````
    "lessonPlan" : {
      "prototype" : "lessonPlan"
    }
````

Create a subtest prototype based on one of the current prototypes.
 
A typical prototype usually needs the following methods:
- initialise
- i18n
- render
- onShow - for processing displayCode
- getResult - process data before it is saved

Add the prototype to _docs/configuration.json

Create classes on client as well as editor.