import React, { Component } from 'react';

class Cropper extends Component {
  setRef = (e) => this.el = e;

  cropImage = () => {
    this.crop.result('canvas')
      .then((resp) => this.props.onPick('imgSrc', resp ));
  };

  readFile = (e) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function () {
        console.log('here');
        console.log(this.width, this.height);
        this.crop.bind({ url: e.target.result });
      };

      reader.readAsDataURL(input.files[0]);
    } else {
      alert('your browser doesnt support file reader');
    }
  };

  componentDidMount() {
    this.crop = new Croppie(this.el, {
      viewport: {
        width: 200,
        height: 200,
        type: 'circle',
      },
      boundary: {
        width: 300,
        height: 300,
      }
    });
  }

  render() {
    return (
      <div ref={this.setRef}>
        <input
          type="file"
          onChange={this.readFile}
        />
        <button onClick={this.cropImage}>result</button>

      </div>
    );
  }
}

export default Cropper;
