# calidation

Red hot validation for React 🌶

[![Build Status](https://travis-ci.org/selbekk/calidation.svg?branch=master)](https://travis-ci.org/selbekk/calidation) [![codecov](https://codecov.io/gh/selbekk/calidation/branch/master/graph/badge.svg)](https://codecov.io/gh/selbekk/calidation) [![npm version](https://badge.fury.io/js/calidation.svg)](https://badge.fury.io/js/calidation)

```
yarn add calidation
```

## What's this?

This is a validation library for React! It provides you with powerful and
flexible validation, which is probably what you're looking for.

I have written [the best blog post](https://medium.com/@selbekk/introducing-calidation-7d9a79453f7)
of all time about this.

## How do you even?

Let's say you have a form you want to validate. Remove that old school
`<form />` tag and replace it with a fly af `<FormValidation />` component!

### Step 1: Specify your fields

First, you specify a config object that specifies the names of the fields you
want to validate, and the validators to apply to each field.

```js
const formConfig = {
    username: {
        isRequired: 'Username is required!',
    },
    password: {
        isRequired: 'Password is also required!',
        isMinLength: {
            message: 'Password must at least be 8 characters long',
            length: 8,
        },
    },
};
```

In this config, we validate two fields - `username` and `password`. These keys
are matched with your `<input name />` property. Each matching object is a list
of validators.

Here, the key is the name of the validator, and the value is either the error
message as a string, or an object with a simple validation configuration.
You can add as many validators as you want, and they'll be run from top to
bottom. For more about validators, go to the [validators](#validators) section!

### Validate that form

Alright, so this is how it looks:

```js
import { FormValidation } from 'calidation';

const config = {...}; // See above
const MyForm = props => (
    <FormValidation onSubmit={props.onSubmit} config={config}>
        {({ fields, errors, submitted }) => (
            <>
                <label>
                    Username: <input name="username" value={fields.username} />
                    {submitted && errors.username && <span>{errors.username}</span>}
                </label>
                <label>
                    Password: <input name="password" value={fields.password} />
                    {submitted && errors.password && <span>{errors.password}</span>}
                </label>
                <button>Log in</button>
            </>
        )}
    </FormValidation>
);
```

The `<FormValidation />` component accepts a function as a child, which is
called with an options object containing field values, errors and so on.

The `<FormValidation />` component renders a `<form />` tag, so you get a nicer
user experience out of the box! You can pass an `onSubmit` event handler, which
will be called with the field values and errors:

```js
onSubmit = ({ errors, fields, isValid }) => {
    if (isValid) {
        server.saveAllTheData(fields);
    }
};
```

### Validate complex forms

Some times, you end up with advanced forms, and you don't want to specify all
the fields in the same configuration object. There might be many reasons for
this, like when certain parts of your form is visible only if certain conditions
are met.

For those cases, we have two new components - `<Form />` and `<Validation />`.

The `<Form />` component works as the `<form />` HTML tag, wrapping the entire
complex form. You can put this at the top level of your page container
component, for example. This component accepts an `onSubmit` handler, similar to
what you're used to from `<FormValidation />`.

The `<Validation />` component is a descendant of a given `<Form />` component,
and wraps your input fields, dropdowns and radio buttons. It expects a
`config` prop, an optional `initialFields` prop, and a function as a child, just
like `<FormValidation />`. Here

Here's an example:

```js
import { Form, Validation } from 'calidation';
const MyPage = props => (
    <Form onSubmit={props.onSubmit}>
        <Validation config={props.config}>
            {({ fields, errors }) => (
                <>
                    Who is your daddy?
                    <input name="daddy" value={fields.daddy} />
                </>
            )}
        </Validation>
        {/* ...tons of other components and other stuff */}
        <Validation config={props.anotherConfig}>
            {({ fields, errors }) => (
                <>
                    What does he do?
                    <input name="dadWork" value={fields.dadWork} />
                </>
            )}
        </Validation>
    </Form>
);
```

The `onSubmit` handler will receive a merged object of all the validated fields
below it, as well as a merged object of all the errors:

```js
const onSubmit = ({ fields, errors, isValid }) => {
    // fields and errors now contain both `daddy` and `dadWork`
    // isValid is true if all forms are valid, otherwise false.
};
```

## Validators

All validators require a configuration object that looks like this:

```js
someField: {
    isRequired: {
        message: 'This is the error message shown if the validation fails',
    },
},
```

If you only specify the `message` key, you can just pass the message string
directly, like this:

```js
someField: {
    isRequired: 'This is the error message shown if the validation fails',
},
```

You can skip validation of a certain validation if you specify a `validateIf`
function. It will receive the other validated fields as an argument.

```js
someField: {
    isRequired: {
        message: 'You need to answer this question',
        validateIf: ({ errors, fields }) => fields.someOtherField === 'foo',
    },
},
```

If you want to do cross validation, or just need access to the other field inputs and / or errors, each validator also
accepts a function that receives all fields and the current error state.

```js
password: {
    isRequired: 'You need a password',
},
repeatPassword: {
    isRequired: 'Please fill out the password a second time',
    isEqual: ({ fields }) => ({
        message: 'The two password must match',
        value: fields.password,
        validateIf: fields.password.length > 0, // this can be a boolean too!
    }),
}
```

Finally, please note that validation happens from top to bottom. The validation
will quit once it encounters an error, so you can have multiple levels of
validators if you so please.

### Default validators

calidation comes with a lot of validators built in. These should be enough for
most common use-cases. You'll find them all in the sister package
[`calidators`](https://github.com/selbekk/calidators).

#### `isRequired`

Validates that a field has some content.

```js
someField: {
    isRequired: 'This field is required', // shorthand
    isRequired: { message: 'This field is required' },
},
```

#### `isNumber`

Validates that a field only contains numeric characters

```js
someField: {
    isNumber: 'You need to enter a number', // shorthand
    isNumber: { message: 'You need to enter a number' },
},
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
},
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
    },
},
```

#### `isEmail`

Validates that a field is a potentially valid email address.

```js
someField: {
    isEmail: 'Please enter a valid e-mail address', // Shorthand
    isEmail: { message: 'Please enter a valid e-mail address' },
},
```

#### `isRegexMatch`

Validates that a field matches a given regular expression.

```js
someField: {
    isRegexMatch: {
        message: 'You need to enter four digits',
        regex: /^\d{4}$/,
    },
},
```

#### `isWhitelisted`

Validates that a field is present in a provided whitelist. The whitelist must be
an array.

```js
firstName: {
    isWhitelisted : {
        message: 'Bros only, bro',
        whitelist: ['Chad', 'Bret'],
    },
},
```

#### `isBlacklisted`

Validates that a field is not present in a provided blacklist. The blacklist
must be an array.

```js
firstName: {
    isBlacklisted : {
        message: 'Bros are not welcome',
        blacklist: ['Chad', 'Bret'],
    },
},
```

#### `isMinLength`

Validates that a field is at least a given number of characters long.

```js
someField: {
    isMinLength: {
        message: 'You need at least four characters',
        length: 4,
    },
},
```

#### `isMaxLength`

Validates that a field is at most a given number of characters long.

```js
someField: {
    isMaxLength: {
        message: 'You can at most have four characters',
        length: 4,
    },
},
```

#### `isExactLength`

Validates that a field is exactly a given number of characters long.

```js
someField: {
    isExactLength: {
        message: 'Norwegian postal codes are four digits long',
        length: 4,
    },
},
```

### Custom validators

You can add your own too! In that case, wrap your app with the
`<ValidatorsProvider />` component, and pass it an object with your custom
validators. It can look like this:

```js
import { ValidatorsProvider } from 'calidation';
const extraValidators = {
    isEven: (config, context) => value =>
        Number(value) % 2 !== 0 ? config.message : null,
    isOdd: (config, context) => value =>
        Number(value) % 2 !== 1 ? config.message : null,
};

<ValidatorsProvider validators={extraValidators}>
    <App />
</ValidatorsProvider>;
```

See how I implemented those custom validators? It's a nested function, the first function
passes the `config` and `context` to the validator function, which passes in the `value` of the field being being validated by that validator. The validator then either returns an
error message or `null`.

The `context` contains `{fields, errors}` which are collections of all fields and all the errors so far.

You might want to let them accept a `value` of empty string or null too,
in case your field is not required.

## API

### `FormValidation`

`import { FormValidation } from 'calidators';`

When you have a simple form to validate.

#### Props

##### `children: func.isRequired`

The `children` function is called with an object with the following props:

```js
{
    errors: object, // object with the same keys as `fields`, but with error messages
    fields: object, // object with the form field values, to make controlled components
    setField: func, // callback accepting a diff object, updating fields like setState
    submit: func, // call this to programmatically trigger a submitted state
    submitted: bool, // flag showing whether the form has been submitted once or not
    resetAll: func, // call this to programmatically trigger a full state reset
}
```

The `setField` function is used whenever you want to update a field outside of
a typical `change` event. Pass an object with the diff you want to apply (like
React's `setState`), and it will update and reevaluate your form.

##### `config: object.isRequired`

The config object specifies what you want to validate, and which validators to
apply to it.

Each validator can accept an object with a `message` key or - in the case where
you don't have to specify anything other than a validation message - just a
string with the error message.

##### `initialValues: object`

The `initialValues` object lets you specify the initial values of the form
fields. These values are available from the `fields` argument in the `children`
function, which lets you control your form fields.

##### `onSubmit: func`

This callback is fired whenever the form is submitted. That can happen whenever
somebody clicks the submit button, or hits `enter` in the form.

The `onSubmit` function is called with an object with the following props:

```js
{
    errors: object, // Object with all error messages, keyed per field
    fields: object, // Object with all field inputs, keyed per field
    isValid: bool, // Boolean indicating whether your form is valid or not
}
```

### `Form`

`import { Form } from 'calidators';`

When you want to wrap a complex form (in conjunction )

#### Props

##### `onSubmit: func`

This callback is fired whenever the form is submitted. That can happen whenever
somebody clicks the submit button, hits `enter` in the form, or calls the `submit` function passed in the `children`
function.

The `onSubmit` function is called with an object with the following props:

```js
{
    errors: object, // Object with all error messages, keyed per field
    fields: object, // Object with all field inputs, keyed per field
    isValid: bool, // Boolean indicating whether your form is valid or not
}
```

##### `onReset: func`

This callback is fired whenever the form is reset. That can happen whenever somebody clicks a button with type "reset",
or calls the `resetAll` function passed in the `children` function.

The `onReset` function is called with no parameters.

### `Validation`

`import { Validation } from 'calidators';`

When you want to wrap a sub-set of your form in validation logic (in conjunction
with the `Form` tag)

#### Props

##### `config: object.isRequired`

The config object specifies what you want to validate, and which validators to
apply to it.

Each validator can accept an object with a `message` key or - in the case where
you don't have to specify anything other than a validation message - just a
string with the error message.

### `ValidatorsProvider`

`import { ValidatorsProvider } from 'calidators';`

When you want to provide your application with a few more validators. Wrap your
app with this at the top level.

#### Props

##### `validators`

An object with functions according to the
[validators](https://github.com/selbekk/calidators) spec. TL;DR: A function that
returns a function that returns a function that decides whether or not your
input if fair. Relax - here's an example:

```js
const validators = {
    isBadTaste = config => value => value === 'Justin Bieber',
};
<ValidatorsProvider validators={validators}>
    {...}
</ValidatorsProvider>
```

## Want to contribute?

I'd love some help! Report bugs, help me document stuff, create new validators
and add new features!
