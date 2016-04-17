import React, { Component } from 'react';

class Cropper2 extends Component {
  // state = { src: '' };

  readFile = (e) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      const self = this;

      reader.onload = (e) => {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function() {
          // self.setState({ src: e.target.result});
          self.props.onPick('uploadImg', {
            width: this.height,
            height: this.width,
            src: e.target.result,
          });
        };
      };

      reader.readAsDataURL(input.files[0]);
    }
  };


  render() {
    return (
      <div ref={this.setRef}>
        <input
          type="file"
          onChange={this.readFile}
        />
      </div>
    );
  }
}

export default Cropper2;
