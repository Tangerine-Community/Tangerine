# Role Based Access 

A Device Users' Role can be used restrict access to specific Case Events, Event Forms, and inputs on Forms.

- [Getting started with using Device User Roles](https://youtu.be/ntL-i8MVpew)
- [Demo: Device User role based access to Event Forms](https://youtu.be/T0GfYHw6t6k)
- [Demo: Device user role based permissions for Case Events](https://www.youtube.com/watch?v=5okk6XrrfaA&feature=youtu.be)

To retrict access to an input on a form by role, use the `T.user.getRoles()` function to get the roles of the currently logged in user.

```html
<tangy-input name="example" label="Example" show-if="T.user.getRoles().includes('admin')"></tangy-input>
```



