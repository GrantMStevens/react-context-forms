# react-context-forms

This project is still under construction, with the possibility of breaking changes. It depends on [Classnames](https://github.com/JedWatson/classnames)

## Installation

`npm i react-context-forms`


## Usage

This project contains two Reactjs components, `<Form>` and `<Input>`, that can be used to provide UI validation for your React applications.

### Input

The `<Input>` component uses props based validation attributes and exposes a number of properties on itself that will convey its validation status. Here are the currently exposed validation options

```
<Input 
required
min="0" 
max="1" 
min-length="1" 
max-length="1"
numeric
pattern={/^[0-9]*\.?[0-9]*$/}
debounce="500"
/>
```

The `<Input>` component exposes the `valid`, `invalid`, `dirty`, `pristine`, and `touched` properties on itself that can be accessed from a ref and applies css classes with the same names. It also exposes the following functions: `setPristine()`, `setInvalid()`, `runValidators()`

An `onChange` event will fire for the input and its execution will be delayed by the debounce value if set.

#### Input type

The input type can contain all of the standard html input types, as well as `numeric` and `textarea` options. A numeric `<Input>` will use a regex to strip out all non-numeric characters (but enables floating point values). Using `textarea` will render a textarea instead of an input and can accept `cols` and `rows` while providing all of the same functionality that a standard input will accept.



### Form

The `<Form>` comonent exposes the same properties and css classes available on the `<Input>` component, but these properties will reflect the combined validity state of its child `<Input>` components. It also exposes `validateForm()` and `setPristine()` functions, as well as an `onUpdate` callback that fires when `validateForm()` is called or when any of its children change to update the form's validation status.

#### Child input relationships

The `<Form>` component uses React's context to find all of its child `<Input>` components and stores a reference to them. When one of these input components fires its `onChange` event, it will also trigger the form's `validateForm()` function to update the form's state to reflect the combined validity of its child inputs.


## Simple example

Here is a simple, albeit slightly contrived example. The usage of state here is purely for illustration purposes.

```
import React, { Component } from 'react'
import { render } from 'react-dom'
import classNames from 'classnames'
import {Form, Input} from 'react-context-forms'

export default class MyFormComponent extends Component {
  constructor(props){
    super(props);

    this.state = {
      user: {
          id: 111,
          name: 'John Smith',
          age: 34,
          address: '123 Main Street'
        },
      formIsValid: false
    }
  }

  componentDidMount(){
    console.log(this.refs.myForm.valid)
    if (this.refs.myForm.valid !== this.state.formIsValid){
      this.setState({
        formIsValid: this.refs.myForm.valid
      })
    }
  }

  onFormUpdate(){
    this.setState({
      formIsValid: this.refs.myForm.valid
    })
  }

  onFormInputChanged(field, ref, e){
    console.log('input changed');
    bin.log(ref);
    var state = {};
    state[ref + 'Valid'] = this.refs[ref].valid
    var user = this.state.user;
    user[field] = e.target.value;
    state.user = user;
    this.setState(state);
  }

  render(){
  return <div>
    <Form ref="myForm" onUpdate={this.onFormUpdate.bind(this)}>
        <div>
          <div>
            <label>Name</label>
            <Input type="text" required defaultValue={this.state.user.name}
              onChange={this.onFormInputChanged.bind(this, 'name')} />
          </div>
          <div>
            <label>Age</label>
            <Input type="numeric" required min="18" defaultValue={this.state.user.age}  ref="ageInput"
              onChange={this.onFormInputChanged.bind(this, 'age', 'ageInput')} />
            <span style={{visibility: this.state.ageInputValid ? 'visible' : 'hidden'}}>Person must be at least 18 years old!</span>
          </div>
        </div>
      <h4>{'Form is valid: ' + this.state.formIsValid}</h4>
    </Form>
  </div>
  }
}

```
