import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.childrenToValidate = [];

        var val = props.value || props.defaultValue;

        this.dirty = false;
        this.pristine = true;
        this.valid = true;
        this.invalid = true;
        this.touched = false;

        this.state = {
            valid: this.valid,
            pristine: this.pristine,
            invalid: this.invalid,
            touched: this.touched,
            dirty: this.dirty
        };

        this.validateForm = this.validateForm.bind(this);
        this.setPristine = this.setPristine.bind(this);
    }

    getChildContext() {
        return {
            validateParentForm: this.onFormChange.bind(this),
            getFormReferences: this.getInputRefs.bind(this)
        };
    }

    getInputRefs(input){
        this.childrenToValidate.push(input);
    }

    updateFormState(){
        this.setState({
            valid: this.valid,
            pristine: this.pristine,
            invalid: this.invalid,
            touched: this.touched,
            dirty: this.dirty
        })
    }

    setPristine(){
        this.childrenToValidate.map((child) => {
            child.setPristine();
        });

        this._validateForm();
        this.updateFormState();
    }

    validateForm() {
        console.log('calling');
        this._validateForm(true);
        this.updateFormState();
    }

    handleFormSubmit(e){
        if (this.props.onSubmit){
            e.preventDefault();
            this.props.onSubmit(e)
        }
    }

    _validateForm(isFinalValidation){
        this.dirty = false;
        this.pristine = true;
        this.valid = true;
        this.invalid = false;
        this.touched = false;

        this.childrenToValidate.map((child) => {
            child.runValidators(undefined, isFinalValidation);
            if (!child.valid) this.valid = false;
            if (!child.pristine) this.pristine = false;
            if (child.invalid) this.invalid = true;
            if (child.touched) this.touched = true;
            if (child.dirty) this.dirty = true;
        });

        if (this.props.onUpdate) this.props.onUpdate(this);
    }

    onFormChange(child, e){
        this._validateForm();
        this.updateFormState();
    }

    setInvalid(){
        this.valid = false;
        this.invalid = true;
        this.touched = true;
        this.updateFormState();
    }

    render() {
        let classes = classNames({
            valid: this.state.valid,
            invalid: !this.state.valid,
            touched: this.state.touched,
            pristine: this.state.pristine,
            dirty: this.state.dirty
        }, this.props.className || {});

        return (
            <form name={this.props.name} className={classes} onChange={this.onFormChange.bind(this, undefined)}
                  style={this.props.style} onSubmit={this.handleFormSubmit.bind(this)}>
                {this.props.children}
            </form>
        )
    }
}

Form.childContextTypes = {
    validateParentForm: React.PropTypes.func,
    getFormReferences: React.PropTypes.func
};