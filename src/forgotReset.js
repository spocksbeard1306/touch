const $spinner = $('#spinner');
const show = () => $spinner.show();

$('button').on('click', show);
$('form').on('submit', show);

