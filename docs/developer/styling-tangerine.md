# Styling Tangerine

## Client

For most of the Angular components in client, the style rules are declared in "src/styles.scss". Forms rendered using the tangy-form library are 
styled by rules set by the tangy-form web component and its dependent inputs. It is possible to do some theming in tangy-form. 
From its README: "You can provide some CSS overrides by providing a custom style definition in your app's index.html." Note how styles 
are set in "client/sec/index.html"

```html
  <custom-style>
    <style>
      html {
        --document-background-color: #FAFAFA;
        --primary-color-dark: #3c5b8d;
        --primary-text-color: var(--light-theme-text-color);
        --primary-color: #3c5b8d;
        --accent-color: #f26f10;
        --accent-text-color: #FFF;
        --error-color: var(--paper-red-500);
        --warn-color: #993f0b;
        --warn-background-color: #f4e688;
        --disabled-color: #BBB;
      }
      h1, h2, h3, h4, h5 {
        @apply --paper-font-common-base;
        color: var(--primary-text-color);
        margin: 25px 0px 5px 15px;
      }
    </style>
  </custom-style>
```

When the form is rendered in client, the custom-style rules are declared beneath the other declared rules, since they are inside the <body> tag. 