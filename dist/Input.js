import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const validationProps = ['minLength', 'maxLength', 'required', 'numeric', 'pattern', 'max', 'min'];

export default class Input extends Component {
    constructor(props) {
        super(props);

        // default validation values, will get overriden when validation runs on the component
        this.valid = true;
        this.invalid = false;
        this.touched = false;
        this.pristine = true;
        this.dirty = false;
        this.hasValue = false;

        this.validationErrors = {};
        this.canValidate = true;

        this.state = {
            value: props.value,
            valid: this.valid,
            invalid: this.invalid,
            touched: this.touched,
            pristine: this.pristine,
            dirty: this.dirty,
            hasValue: false
        };

        this.runValidators = this.runValidators.bind(this);
        this.setPristine = this.setPristine.bind(this);
        this.setInvalid = this.setInvalid.bind(this);
        this.focus = this.focus.bind(this);
    }

    updateInputState(){
        this.setState({
            valid: this.valid,
            invalid: this.invalid,
            touched: this.touched,
            pristine: this.pristine,
            dirty: this.dirty,
            hasValue: this.hasValue
        })
    }

    componentDidMount(){
        this.bootstrapComponent();
        if (this.context.getFormReferences)
            this.context.getFormReferences(this);
    }

    componentWillReceiveProps(nextProps){
        if (this.state.value === '' || this.state.value === undefined){
            this.setState({
                value: nextProps.defaultValue
            })
        }

        if (this.state.check)
            this.bootstrapComponent();
    }

    bootstrapComponent(){
        var value = ReactDOM.findDOMNode(this.refs.currentInput).value;

        if (value || this.props.defaultValue || (!this.props.defaultValue && (this.props.defaultValue === false || this.props.defaultValue === 0))
            || this.props.value || (!this.props.value && (this.props.value === false || this.props.value === 0))){
            this.pristine = false;
            this.dirty = true;
        }
        if (value || value === false || value === 0){
            value = value;
        } else if (this.props.value || this.props.value === false || this.props.value === 0){
            value = this.props.value;
        } else {
            value = this.props.defaultValue;
        }

        this._runValidators(value);
        if (this.context.validateParentForm) this.context.validateParentForm(this);
    }

    setValid(propName) {
        delete this.validationErrors[propName];
        return true;
    }

    _setInvalid(propName) {
        this.validationErrors[propName] = true;
        return false;
    }

    minLength(val) {
        if (!val && val !== false && val !== 0){
            val = '';
            if (!this.props.required){
                return this.setValid('minLength');
            }
        }

        return ((val.length || 0) < this.props.minLength) ? this._setInvalid('minLength') : this.setValid('minLength');
    }

    maxLength(val) {
        if (!val && val !== false && val !== 0) val = '';
        return ((val.length || 0) > this.props.maxLength) ? this._setInvalid('maxLength') : this.setValid('maxLength');
    }

    required(val, isFinalValidation) {
        return (!val && val !== 0 && val !== false) ? this._setInvalid('required') : this.setValid('required');

    }

    numeric(val, isFinalValidation) {
        if ((val === undefined || val === '') && !this.props.isRequired) return true;
        if (this.touched || isFinalValidation){
            var match = val.match(/^[0-9]*\.?[0-9]*$/);
            return match ? this.setValid('numeric') : this._setInvalid('numeric');
        } else return true;

    }

    pattern(val) {
        if (val === undefined || val === '') return true;
        return (val.match(this.props.pattern)) ? this.setValid('pattern') : this._setInvalid('pattern');
    }

    max(val) {
        if (val === undefined || val === '') return true;
        var match = val.match(/^[0-9]*\.?[0-9]*$/);
        if (!match) return false;
        return (Number.parseFloat(val) > Number.parseFloat(this.props.max)) ? this._setInvalid('max') : this.setValid('max');
    }

    min(val) {
        if (val === undefined || val === '') return true;
        var match = val.match(/^[0-9]*\.?[0-9]*$/);
        if (!match) return false;
        return (Number.parseFloat(val) < Number.parseFloat(this.props.min)) ? this._setInvalid('min') : this.setValid('min');
    }

    runValidators(val, isFinalValidation) {
        if (!this.refs.currentInput) return false;
        val = this.props.type === 'checkbox' ? ReactDOM.findDOMNode(this.refs.currentInput).checked : ReactDOM.findDOMNode(this.refs.currentInput).value;
        var valid = this._runValidators(val || this.state.value, isFinalValidation);
        this.updateInputState();
        return valid;
    }

    _runValidators(val, isFinalValidation){
        var valid = true;
        validationProps.map(prop => {
            if (this.props[prop]){
                if (!this[prop](val, isFinalValidation)) valid = false;
            }
        });

        if (this.props.type === 'number'){
            if (!this.numeric(val) && (val || val !== 0)) valid = false;
        }

        if (val !== undefined && val !== ''){
            this.hasValue = true;
        }

        this.valid = valid;
        this.invalid = !valid;
        if (isFinalValidation) this.touched = true;
        return valid;
    }

    onInputFocus(e){
        this.touched = true;
        var val = this.props.type === 'checkbox' ? e.target.checked : e.target.value;
        this._runValidators(val);
        this.updateInputState();
        if (this.props.onFocus) this.props.onFocus(e)
    }

    onInputBlur(e){
        if (this.props.onBlur) this.props.onBlur(e)
    }

    onKeyUp(e){
        if (this.props.onKeyUp) this.props.onKeyUp(e);
    }

    onInputChanged(e) {
        var val = this.props.type === 'checkbox' ? e.target.checked : e.target.value;
        if (this.props.type === 'number'){
            val = e.target.value.replace(/[^-?0-9.]/g, "");
            this.setState({
                value: val
            });

            if (!val && (val != 0)){
                return;
            }
        }

        this.pristine = false;
        this.dirty = true;

        this._runValidators(val);
        this.updateInputState();
        this.setState({
            value: val
        });
        if (this.context.validateParentForm) this.context.validateParentForm(this);

        if (this.props.debounce && !Number.isNaN(Number.parseInt(this.props.debounce))) {
            clearTimeout(this.debounce);
            this.debounce = window.setTimeout(() => (this.props.onChange || function(val){})(val, e), this.props.debounce)
        } else {
            (this.props.onChange || function(val){})(e)
        }
    }

    setPristine(){
        if (this.props.preventReset){
            return;
        }
        this.pristine = true;
        this.dirty = false;
        this.touched = false;
        this.setState({
            value: ''
        });
        this.refs.currentInput.value = '';
        this.updateInputState();
    }

    setInvalid(){
        this.valid = false;
        this.invalid = true;
        this.touched = true;
        this.updateInputState();
    }

    focus(){
        ReactDOM.findDOMNode(this.refs.currentInput).focus();
    }

    blur(){
        ReactDOM.findDOMNode(this.refs.currentInput).blur();
    }

    render() {
        var classes = classNames({
            'valid': this.state.valid,
            'invalid': !this.state.valid,
            'touched': this.state.touched,
            'pristine': this.state.pristine,
            'dirty': this.state.dirty
        }, this.props.className || {});

        var returnInputType = function(){
            if (this.props.type !== 'textarea'){
                return (
                    <input type={this.props.type} noValidate className={classes} onChange={this.onInputChanged.bind(this)} placeholder={this.props.placeholder}
                           onFocus={this.onInputFocus.bind(this)} defaultValue={this.props.defaultValue} value={this.state.value}
                           disabled={this.props.disabled} checked={this.state.value} ref="currentInput" onKeyUp={this.onKeyUp.bind(this)}
                           onBlur={this.onInputBlur.bind(this)} style={this.props.style}/>
                )
            } else {
                return (
                    <textarea noValidate className={classes} onChange={this.onInputChanged.bind(this)} placeholder={this.props.placeholder}
                              onFocus={this.onInputFocus.bind(this)} defaultValue={this.props.defaultValue} value={this.state.value}
                              disabled={this.props.disabled} rows={this.props.rows} columns={this.props.columns} ref="currentInput" onKeyUp={this.onKeyUp.bind(this)}
                              onBlur={this.onInputBlur.bind(this)} style={this.props.style}/>
                )
            }
        };

        return (
            returnInputType.bind(this)()
        )
    }
}

Input.contextTypes = {
    validateParentForm: React.PropTypes.func,
    getFormReferences: React.PropTypes.func
};