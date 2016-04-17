import React, { Component } from 'react';
import request from 'superagent';
import swal from 'sweetalert';

import allPoints from '../points';

const previewImageSize = {
  width: 365,
  height: 336,
};

const cropImage = ({
  shape,
  img,
  canvas,
  top,
  left,
  scale,
  uploadImgHeight,
}) => {
  const points = allPoints[shape];
  const ctx = canvas.getContext('2d');
  canvas.width = previewImageSize.width;
  canvas.height = previewImageSize.height;
  const scaleWidth = previewImageSize.width * scale;

  // ctx.save();
  ctx.beginPath();

  for (let i=0; i < points.length; i++){
    let point = points[i];
    ctx.lineTo(point[0], point[1]);
  }

  ctx.closePath();
  // ctx.stroke();
  ctx.clip();

  ctx.drawImage(img, left, top, scaleWidth, uploadImgHeight);

  // ctx.restore();
};

class Preview extends Component {
  setRefImage = e => this.img = e;
  setRefOverlay = e => this.overlay = e;
  setRefCanvas = e => this.canvas = e;

  changeScale = (val) => {
    const value = Number(val);
    this.props.updateScale(value);
  }

  clearImage = (e) => {
    if (this.props.step === 2) {
      this.props.onPick('uploadImg', {
        src: null,
      });
    }
    this.props.lastStep();
  }

  next = (e) => {
    this.props.nextStep();
  }

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
  }

  submit = () => {
    if ($('.login').length) {
      swal('Usuario no logeado', 'Debe iniciar sesion para finalizar la compra', 'error');
    } else {
      this.crop();
      this.props.onSubmit(this.canvas.toDataURL());
    }
  }

  crop = () => {
    cropImage({
      shape: this.props.shape.value,
      img: this.img,
      canvas: this.canvas,
      top: parseInt(this.props.top, 10),
      left: parseInt(this.props.left, 10),
      scale: this.props.percWidth / 100,
      uploadImgHeight: this.$img.height(),
    });
  };

  share = () => {
    this.crop();
    this.props.share({
      imgSrc: this.canvas.toDataURL(),
      shape: this.props.shape.value
    });
  }

  uploadFile = (e) => {
    console.log('here', this.inputFile)
    this.inputFile.click(); 
  }

  setRefInput = (e) => this.inputFile = e;

  componentDidMount() {
    this.$overlay = $(this.overlay);
    this.$img = $(this.img);

    this.$overlay.draggable({
      drag: () => {
        this.props.updateTopLeft({
          left: this.$overlay.css('left'),
          top: this.$overlay.css('top'),
        });
      }
    });

    this.slider = document.getElementById('slider');

    const data = JSON.parse(document.getElementById('initialState').value);
    let value = 0;
    if (data) {
      value = data.previewImage.scale;
    }

    noUiSlider.create(this.slider, {
      start: [value],
      range: {
        min: [-20],
        max: [70],
      },
    }).on('update', (values, handle) => {
      this.changeScale(values[0]);
    });
  }

  render() {
    const {
      step,
      shape,
      uploadImg,
      percWidth,
      scale,
      left,
      top,
    } = this.props;

    return (
      <div id="preview">

        <input
      ref={this.setRefInput}
      style={{display: 'none'}}
      type="file"
      onChange={this.readFile}
      />
        <canvas ref={this.setRefCanvas} style={{display: 'none'}}>
        </canvas>
        <div style={{
          width: previewImageSize.width,
          height: previewImageSize.height,
          position: 'relative'
        }}>

        <div className="preview"
          style={previewImageSize}>
          <img
            ref={this.setRefImage}
            className="cropped-image"
            src={uploadImg.src}
            style={{
              width: `${percWidth}%`,
              left,
              top,
              position: 'absolute'
           }} />
        <img
      className="preview-shape"
      src={shape.url}
        />

          <div
            className="overlay"
            ref={this.setRefOverlay} />
        {
          !uploadImg.src &&
            <div id="upload" onClick={this.uploadFile}>CLICK AQUI <br/> para subir su imagen</div>
        }
        </div>
          <div className="btn-preview">
            <span onClick={this.uploadFile}>Subir fotografía <img src="public/img/botSubir.gif" /></span>
            <span onClick={this.clearImage}>Deshacer <img src="public/img/botDeshacer.gif" /></span>
            <span onClick={this.next}>Listo <img src="public/img/botOk.gif" /> </span>

          </div>

      </div>
        <div id="slider"></div>
        <button ref={this.props.refShare} onClick={this.share} className="hide"></button>
        <button ref={this.props.refSubmit} className="hide"  onClick={this.submit}>Confirmar</button>
      </div>
    );
  }
}

export default Preview;
