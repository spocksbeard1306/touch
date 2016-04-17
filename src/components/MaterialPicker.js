import React, { Component } from 'react';

import RadioFields from './RadioFields';

const materials = [
  { label: 'Plata', value: 'Plata'},
  { label: 'Oro 18K', value: 'Oro 18K'},
  { label: 'Plata con baño de oro 18k', value: 'Plata con baño de oro 18k'},
];

const MaterialPicker = ({
  material,
  onPick,
}) => (
  <div id="material-picker">
    <div className="title">Escoge el material</div>
    <RadioFields
  options={materials}
  name={'material'}
  selected={material}
  onChange={onPick}
    />
  </div>
);

export default MaterialPicker;
