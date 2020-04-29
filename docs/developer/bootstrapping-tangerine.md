# Bootstrapping Tangerine

During a recent Angular 8 upgrade process, we had to change how Tangerine initializes. If Tangerine is running inside a Cordova app, it must wait until the 'deviceReady' event is emitted. Our earlier method of doing this in main.ts is no longer possible; therefore, we are intercepting the Service initialization process by using APP_INITIALIZER to pause the app while Cordova loads. Here is the [relevant comit](https://github.com/Tangerine-Community/Tangerine/commit/14ae469e15292e34515a67737d347bca80b966c1). For more information, view the [Predefined tokens and multiple provider](https://angular.io/guide/dependency-injection-providers#predefined-tokens-and-multiple-providers) section in the Angular documentation.

