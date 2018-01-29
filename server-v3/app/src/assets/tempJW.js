// var testMyJW = (function () {  
//   // Methods
//   function notHelloOrGoodbye(){}; // A private method
//   function hello(){alert('hello');}; // A public method because it's returned (see below)
//   function goodbye(){alert('goodbye');}; // A public method because it's returned (see below)

//   // Exposed public methods
//   return {
//       hello: hello,
//       goodbye: goodbye
//   }
// });

var myObject = {
    myFirstName:"John",
    myLastName: "Doe",
    fullName: function () {
        //alert('myFirstName');
        //return this.myFirstName + " " + this.myLastName;
    }
}
//myObject.fullName();         // Will return "John Doe"