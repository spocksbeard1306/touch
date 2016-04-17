import _ from 'lodash';

const $formRecover = $('#form-recover');
const $formSignup = $('#signup-form');
const $btnSignup = $('#submit-signup');
const $spinner = $('#spinner');

const $password = $('#cc-password');
const $confirm = $('#cc-confirm-password');
const $errors = $('#errors');
const $success = $('#success');

const removeError = $el => $el.removeClass('error');

$password.on('blur', _.partial(removeError, $password, _));
$confirm.on('blur', _.partial(removeError, $confirm, _));

const postForm = (
  form,
  cb
) =>
  $.post(
    form.attr('action'),
    form.serialize(),
    cb
  );

$formRecover.submit((e) => {
  console.log('here recover');
  const pws = $formRecover.serializeArray();
  if (pws[0].value !== pws[1].value) {
    e.preventDefault();
    const errors = 'Las claves ingresadas no coinciden';
    return $errors.text(errors).css('display', 'inline-block');;
  };
});

$formSignup.submit((e) => {
  e.preventDefault();
  const fields = $formSignup.serializeArray()
    .reduce(
      (acc, { name, value }) => Object.assign(acc, { [name]: value }),
      {}
    );

  let errors = '';

  if (fields.password !== fields.confirm) {
    $confirm.addClass('error');
    $password.addClass('error');
    errors = 'Las claves ingresadas no coinciden';
    return $errors.text(errors).css('display', 'inline-block');
  }
  $errors.hide();

  $btnSignup.prop('disabled', true);
  $spinner.show();
  postForm($formSignup, function(data) {
    $btnSignup.prop('disabled', false);
    $spinner.hide();
    if (data.hasOwnProperty('error') ) {
      let text = 'Hubo un error. Intente nuevamente.';
      if (data.field === 'username') {
        text = 'El email ya fue utilizado';
      }
      return $errors.text(text).css('display', 'inline-block');
    }
    return $success.text('Usuario creado').css('display', 'inline-block');
  });
});
