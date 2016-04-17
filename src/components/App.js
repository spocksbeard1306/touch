import React, { Component } from 'react';
import request from 'superagent';
import swal from 'sweetalert';
import _ from 'lodash';

import Cropper2 from './Cropper2';
import Preview from './Preview';
import ShapePicker from './ShapePicker';
import SizePicker from './SizePicker';
import MaterialPicker from './MaterialPicker';

import { shapes } from './ShapePicker';

const halfWidth = {
  float: 'left',
  width: '50%'
};

const btnStyle = {
  backgroundColor: '#ff46ab',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  height: '42px',
  margin: '27px auto',
  outline: 'none',
  textShadow: '-2px 1px 0 rgba(0,0,0,0.5)',
  width: '227px',
  fontFamily: 'Pacifico, cursive',
};

const unitPrice = 20;

class App extends Component {

  state = {
    step: 1,
    previewImage: {
      percWidth: 100,
      scale: 0,
      left: 0,
      top: 0,
    },
    size: null,
    shape: shapes[0],
    material: null,
    phrase: null,
    uploadImg: {
      src: null
    },
    amount: 1,
    address: null,
    reference: null,
  };
  refSubmit = (e) => this.btnSubmit = e;
  submit = (e) => {
    this.btnSubmit.click();
  }
  refShare = (e) => this.btnShare = e;

  toShare = (e) => this.btnShare.click();

  share = (data) => {
    if (!this.state.uploadImg.src) {
      return swal({
        title: 'Error',
        type: 'error',
        text: 'Debe subir una imagen para compartir'
      });
    }
    swal({
      title: 'Generando imagen',
      text: `Estamos generando la imagen <div class="fa fa-spin fa-spinner "></span>`,
      html: true,
    });
    request
      .post('/generateImage')
      .send(data)
      .end((err, res) => {
        swal.close();
        if(err || res.body.hasOwnProperty('error')) {
          return swal('Error', 'No se pudo generar la imagen');
        };
        console.log(res.body);
        FB.ui({
          method: 'feed',
          name: 'YUYARI',
          // picture: res.body.url,
          picture: 'http://i.imgur.com/tXNgITCb.jpg',
          caption: 'Tu historia en un accesorio'
        }, (res) => {
          console.log(res);
        });

      });
  }

  componentDidMount() {
    $('.login').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.login();
    });
    const data = JSON.parse(document.getElementById('initialState').value);
    if (!data) {
      return;
    }
    console.log(_.omit(data, ['uploadImg']));
    this.setState(data);
  }

  updateTopLeft = ({ top, left }) => {
    const { previewImage } = this.state;
    previewImage.top = top;
    previewImage.left = left;
    this.setState({ previewImage });
  }

  updateScale = (scale) => {
    const { previewImage } = this.state;
    previewImage.scale = scale;
    previewImage.percWidth = 100 + scale;
    this.setState({ previewImage });
  }

  login = () => {
    swal({
      title: 'Guardando',
      text: `Estamos guardando sus avances <div class="fa fa-spin fa-spinner "></span>`,
      html: true,
    });

    request
      .post('/tempSave')
      .send(this.state)
      .end((err, res) => {
        swal.close();
        if (err) {
          return swal('Error', 'No se pueden guardar los datos', 'error');
        }
        console.log('here');
        window.location = '/login'
      });
  }

  nextStep = () => {
    const nextStep = this.state.step + 1;
    this.setState({
      step: nextStep > 4 ? 4: nextStep,
    })
  };
  lastStep = () => {
    const nextStep = this.state.step - 1;
    this.setState({
      step: nextStep < 1 ? 1: nextStep,
    })
  };

  updateAddress = ({ target }) => {
    const address = this.state.address;
    address[target.name] = target.value;
    this.setState({address});
  }

  updateField = ({ target }) => this.setState({ [target.name]: target.value });

  onPick = (field, value) => this.setState({ [field]: value });

  onSubmit = (imgCropped) => {

    const {
      size,
      shape,
      material,
      phrase,
      amount,
      address,
      reference,
      previewImage,
    } = this.state;

    const errors = [];

    if (!shape.value) errors.push('Debes seleccionar la forma de tu accesorio.');
    if (!size) errors.push('Debes seleccionar un tamaño.');
    if (!material) errors.push('Debes seleccionar un material.');
    if (!amount) errors.push('Debes indicar la cantidad.');
    if (!address) errors.push('Debes indicar el lugar de entrega.');
    if (!phrase) errors.push('Debes ingresar tu frase.');

    if (errors.length) {
      const text = errors.join('<br/>');
      return swal({
        title: 'Faltan datos',
        text,
        'type': 'error',
        html: true
      });
    }

    swal({
      title: 'Realizar compra',
      text: '',
      type: 'info',
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    }, () => {

        request
          .post('/submit')
          .send({
            size,
            shape: shape.value,
            material,
            phrase,
            amount,
            address,
            reference,
            price: amount * unitPrice,
            imgSrc: imgCropped,
          })
          .end((err, res) => {
            if (err || res.body.hasOwnProperty('error')) {
              return swal('Error', 'No se pudo enviar la informacion', 'error');
            }
            swal({
              title: 'Pedido Generado',
              text: `<div>Forma: <span>${shape.value}</span></div>
<div>Material: <span>${material}</span></div>
<div>Dimensiones del dije: <span>${size}</span></div>
<div>Cantidad: <span>${amount}</span></div>
<div>Precio: <span>S/. ${amount * unitPrice} nuevos soles</span></div>
<div>Lugar de rentrega: <span>${reference}</span></div>
<h2>Gracias por confiar en Yuyari !!!</h2>
`,
              html: true,
              type: 'success'
            });
            // swal('Enviada', 'informacion enviada', 'success');
        });

      }
    );
  }

  render() {
    const {
      step,
      size,
      shape,
      material,
      uploadImg,
      amount,
      address,
      reference,
      phrase,
      previewImage,
    } = this.state;
    console.log(step);
    const isStep4 = step === 4;
    return (
      <section className="dashed-border-wrapper clearfix" id="img-treat">
        <div id="steps" >
          <figure id="barrita" className={`paso${step}`}></figure>
          <div id="pasito-a-pasito">
        <div id="paso1" className={`${step === 1 ? 'active': ''}`}>
        <ShapePicker
      onPick={this.onPick}
      shape={shape}
        />
        </div>
        <div id="paso2" className={`${step === 2 ? 'active': ''}`}>
          <div className="pasito-wrapper clearfix">
            <h3>Paso 2</h3>
            <p>Escala la imagen y determina la ubicación</p>
          </div>
        </div>
        <div id="paso3" className={`${step === 3 ? 'active': ''}`}>
        <div className="pasito-wrapper clearfix">
        <h3>Paso 3</h3>
        <p>Previsializa el fotograbado 3D resultante</p>
        </div>
        </div>

        <div id="paso4" className={`${step === 4 ? 'active': ''}`}>
        <div className="pasito-wrapper clearfix">
        <h3>Paso 4</h3>
        <p>Confirmación de la orden</p>
        </div>
        </div>

          </div>
        </div>
        <Preview
      step={step}
      refSubmit={this.refSubmit}
      onPick={this.onPick}
      updateTopLeft={this.updateTopLeft}
      updateScale={this.updateScale}
      shape={shape}
      uploadImg={uploadImg}
      onSubmit={this.onSubmit}
      nextStep={this.nextStep}
      lastStep={this.lastStep}
      refShare={this.refShare}
      share={this.share}
      {...previewImage}
        />
        <div className="bottom-options" style={{width: '100%'}}>

        <div style={halfWidth}>
        <div>
        <div className="title">Aquí escribe la historia de este accesorio tan especial:</div>
          <input
            type="text"
            name="phrase"
            value={phrase}
            onChange={this.updateField}
          />
        </div>
        {isStep4  &&
         <div>
         <div className="title">Referencia</div>
         <textarea
         value={reference}
         name='reference'
         onChange={this.updateField}
         rows="3"
         />
         </div>

        }
        {
          isStep4 &&
            <div>
            <div className="title">Lugar de entrega</div>
            <textarea
          value={address}
          name='address'
          onChange={this.updateField}
          rows="3"
            />
            <button className="share" onClick={this.toShare} >Compartir en fb</button>
            <button onClick={this.submit} style={btnStyle}>Confirmar</button>
            </div>

        }
        </div>

        {
          isStep4 &&
            <div style={halfWidth}>
          <SizePicker
            onPick={this.onPick}
            size={size}
          />
          <MaterialPicker
            onPick={this.onPick}
            material={material}
          />
          <div>
          <div className="title">Cantidad</div>
          <input
            type="number"
            value={amount}
            name='amount'
            min='1'
            onChange={this.updateField}
          />
          </div>
          <div>Precio: {unitPrice * amount} S/.</div>
        </div>
        }
      </div>
      </section>
    );
  }
}

export default App;
