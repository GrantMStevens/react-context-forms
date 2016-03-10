import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.childrenToValidate = [];

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
        this._validateForm(true);
        this.updateFormState();
    }

    _validateForm(isFinalValidation, child){
        if (child){
            this.dirty = false;
            this.pristine = true;
            this.valid = true;
            this.invalid = true;
            this.touched = false;

            if (!child.valid) this.valid = false;
            if (!child.pristine) this.pristine = false;
            if (child.invalid) this.invalid = true;
            if (child.touched) this.touched = true;
            if (child.dirty) this.dirty = true;
        }

        if (this.props.onUpdate) this.props.onUpdate(this);
    }

    onFormChange(child, e){
        this._validateForm(false, child);
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
            <form name={this.props.name} className={classes} onChange={this.onFormChange.bind(this, undefined)}>
                {this.props.children}
            </form>
        )
    }
}

Form.childContextTypes = {
    validateParentForm: React.PropTypes.func,
    getFormReferences: React.PropTypes.func
};