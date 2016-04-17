import React, { Component } from 'react';

class RadioFields extends Component {
  onPick = ({ target }) => this.props.onChange(target.name, target.value);

  render() {
  const {
    options,
    name,
    onChange,
    selected,
  } = this.props;
  return (
    <div className="radio">
      {
        options.map(({ label, value }) => (
          <label key={value}>
            <input
              type="radio"
              value={value}
              name={name}
              checked={selected === value}
              onChange={this.onPick}
            />
            {label}
          </label>
        ))
      }
    </div>
  );
  }
}

export default RadioFields;
