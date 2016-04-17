import React, { Component } from 'react';

import RadioFields from './RadioFields';

const sizes = [
  { label: '3 cm', value: '3 cm'},
  { label: '5 cm', value: '5 cm'},
  { label: '7 cm', value: '7 cm'}
];

const SizePicker = ({
  size,
  onPick,
}) => (
  <div id="size-picker">
    <div className="title">Dimensiones del dije</div>
    <RadioFields
      options={sizes}
      name={'size'}
      selected={size}
      onChange={onPick}
    />
  </div>
);

export default SizePicker;
