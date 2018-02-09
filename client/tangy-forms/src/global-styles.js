
/*
 * Global style module. 
 * 
 */



import '../node_modules/@polymer/polymer/lib/elements/custom-style.js';

const $_documentContainer = document.createElement('div');
$_documentContainer.setAttribute('style', 'display: none;');

$_documentContainer.innerHTML = `<custom-style>
  <style is="custom-style">
    html {
      --document-background-color: #FAFAFA;
      --primary-text-color: var(--light-theme-text-color);
      --primary-color: var(--paper-blue-900);
      --accent-color: #f26f10;
      --error-color: var(--paper-red-500);
      --disabled-color: #BBB;
      /*
       * Hi. Test the application of colors variables with an override
       * by uncommenting the code below.
      --document-background-color: #93a2b4;
      --primary-text-color: var(--light-theme-text-color);
      --primary-color: #9FADBF;
      --accent-color: #7edfce;
      --error-color: var(--paper-red-500);
      --disabled-color: #BBB;
       */

    
    }
    h1, h2, h3, h4, h5 {
      @apply --paper-font-common-base;
      color: var(--primary-text-color);
      font-weight: 400;
      margin: 25px 0px 5px 15px;
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer);
