import React, { Component } from 'react';

export const shapes = [
  { icon: 'public/img/shapepicker/botCircle', url: 'public/img/circleShape.png', value: 'circle'},
  { icon: 'public/img/shapepicker/botHeart', url: 'public/img/heartShape.png', value: 'heart'},
  { icon: 'public/img/shapepicker/botRect', url: 'public/img/rectShape.png', value: 'rect'},
  { icon: 'public/img/shapepicker/botSquare', url: 'public/img/squareShape.png', value: 'square'},
];

const inlineShapes = {
  backgroundColor: 'rgba(64, 55, 63, 0.8)',
  borderRadius: '15px',
  marginTop: '15px',
  padding: '15px',
  width: '320px'
};

class ShapePicker extends Component {
  onPick = (idx) => this.props.onPick('shape', shapes[idx]);

  render() {
    const {
      shape
    } = this.props;
    return (
        <div className="shape-picker pasito-wrapper clearfix">
          <h3> Paso 1</h3>
          <p>Escoge la forma de tu accesorio</p>
        <div style={inlineShapes}>
        {
          shapes.map(({ icon, value }, i) => (
            <img
              key={i}
            src={icon + ((shape && shape.value === value) ? '':'Off')+ '.png'
              }
              onClick={() => this.onPick(i)}
            />
          ))
        }</div>
      </div>
    );
  }
}

export default ShapePicker;
