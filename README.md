# dayshun

Gangsta ass validation.

```
yarn add dayshun
```

## What dis?

This is a validation library for React! It provides you with powerful and 
flexible validation, which is probably what you're looking for.

## How do you roll?

Let's say you have a form you want to validate. Remove that crusty ass 
`<form />` tag and replace it with a fly af `<FormValidation />` component!

### Configurate, don't playa hate
First, you specify a config object that specifies the names of the fields you 
want to validate:

```js
const config = {
    username: {},
    password: {},
},
```

What about those empty objects? Those are for you to specify the validators in!

```js
const config = {
    username: {
        isRequired: 'Username is required!',
    },
    password: {
        isRequired: 'Password is required!',
    },
};
```

Here, the key is the name of the validator, and the value is the error message.
You can add as many validators as you want, and they'll be run from top to
bottom.

### Validate that form

Alright, so this is how it looks:

```js
import { FormValidation } from 'dayshun';

const config = {}; // We did this above!
const MyForm = (props) => (
    <FormValidation onSubmit={props.onSubmit} config={config}>
        {({ fields, errors }) => (
            <Fragment>
                <label>
                    Username: <input name="username" value={fields.username} />
                    {errors.username && <span>{errors.username}</span>}
                </label>
                <label>
                    Password: <input name="password" value={fields.password} />
                    {errors.password && <span>{errors.password}</span>}
                </label>
                <button>Log in</button>
            </Fragment>
        )}  
    </FormValidation>
);
```

The `<FormValidation />` component accepts a function as a child, which is 
called with an options object containing field values, errors and so far.

The `<FormValidation />` component renders a `<form />` tag, so you get a nicer 
user experience out of the box! You can pass an `onSubmit` event handler, which 
will be called with the field values and errors.

## Validators

This library comes equipped with a lot of validators. You'll find them in the 
code for now, but I'll document them later.

### Default validators

dayshun comes with a lot of validators built in.

#### `isRequired`

Validates that a field has some content.

```js
someField: {
    isRequired: 'This field is required', // shorthand
    isRequired: { message: 'This field is required' },
}
```

#### `isNumber`

Validates that a field only contains numeric characters

```js
someField: {
    isNumber: 'You need to enter a number', // shorthand
    isNumber: { message: 'You need to enter a number' },
}
```

#### `isEqual`

Validates that a field equals a given value. The value is cast to a String, 
and then checked for equality with the `===` operator.

```js
someField: {
    isEqual: { 
        message: 'You need to enter "yes"',
        value: 'yes',
    },
}
```


#### `isGreaterThan` / `isLessThan`

Validates that a field is greater or less than a given number.

```js
someField: {
    isGreaterThan: { 
        message: 'You need to be at least 18 years old',
        value: 17,
    },
    isLessThan: {
        message: 'You can\'t be older than 70 years old',
        value: 66,
    }
}
```

#### `isEmail`

Validates that a field is a potentially valid email address.

```js
someField: {
    isEmail: 'Please enter a valid e-mail address', // Shorthand
    isEmail: { message: 'Please enter a valid e-mail address' },
}
```

#### `isRegexMatch`

Validates that a field matches a given regular expression.

```js
someField: {
    isRegexMatch: { 
        message: 'You need to enter four digits',
        regex: /^\d{4}$/,
    },
}
```

### Deluxe validators

I haven't implemented any yet, but in the future I imagine you can import some 
validators that aren't used that often from `dayshun/validators`. But that's a
future issue to adress.

### Custom validators

You can add your own too! In that case, wrap your app with the 
`<ValidatorProvider />` component, and pass it an object with your custom 
validators. It can look like this:

```js
const extraValidators = {
    isEven: config => value => Number(value) % 2 !== 0 ? config.message : null,
    isOdd: config => value => Number(value) % 2 !== 1 ? config.message : null,
};

<ValidationProvider validators={extraValidators}>
  <App />
</ValidatorProvider>
```

See how I implemented those custom validators? It's a curried function that 
first receives a config object, then the value, and then returns either an 
error message or `null`.

### API Docs

