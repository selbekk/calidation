# calidation

Red hot validation for React 🌶

```
yarn add calidation
```

## What's this?

This is a validation library for React! It provides you with powerful and
flexible validation, which is probably what you're looking for.

## How do you even?

Let's say you have a form you want to validate. Remove that old school
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
import { FormValidation } from 'calidation';

const config = {...}; // We did this above!
const MyForm = props => (
    <FormValidation onSubmit={props.onSubmit} config={config}>
        {({ fields, errors }) => (
            <>
                <label>
                    Username: <input name="username" value={fields.username} />
                    {errors.username && <span>{errors.username}</span>}
                </label>
                <label>
                    Password: <input name="password" value={fields.password} />
                    {errors.password && <span>{errors.password}</span>}
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
        <Validation config={props.config}>
            {({ fields, errors }) => (
                <>
                    And what does he do?
                    <input name="dadWork" value={fields.dadWork} />
                </>
            )}
        </Validation>
    </Form>
);
```

The `onSubmit` handler will receive a merged object of all the validated fields
below it, as well as a merged object of all the errors.

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
        validateIf: fields => fields.someOtherField === 'foo',
    },
},
```

Finally, please note that validation happens from top to bottom. The validation
will quit once it encounters an error, so you can have multiple levels of
validators if you so please.

### Default validators

calidation comes with a lot of validators built in. These should be enough for
most common use-cases.

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

### Deluxe validators

I haven't implemented any yet, but in the future I imagine you can import some
validators that aren't used that often from `calidation/validators`. But that's
a future issue to adress.

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
error message or `null`. You might want to let them accept the empty string too,
in case your field is not required.

## Want to contribute?

I'd love some help! Report bugs, help me document stuff, create new validators
and add new features!
