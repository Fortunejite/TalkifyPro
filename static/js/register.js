/* eslint-disable no-alert */
/* eslint-disable no-undef */
function createUser() {
  const formData = {};
  formData.email = $('#email').val();
  formData.username = $('#name2').val();
  formData.password = $('#pass2').val();
  // formData.profile', $('#file')[0].files[0]);
  $.ajax({
    url: '/signup',
    type: 'POST',
    data: formData,
    dataType: 'json',
    success: (response, text, jqXHR) => {
      if (jqXHR.status === 201) {
        window.location.href = `/?x-token=${response.success}`;
      } else {
        alert(response.error);
      }
    },
    error: (xhr) => {
      const response = JSON.parse(xhr.responseText);
      alert(response.error);
      $('#up').show();
      $('#loadingSpinner').hide();
    },
  });
}

$(document).ready(() => {
  $('#up').click((event) => {
    event.preventDefault();
    $('#name2').css('border', 'none');
    $('#email').css('border', 'none');
    $('#pass2').css('border', 'none');
    $('#pass3').css('border', 'none');
    $('#unames').hide();
    $('#uemail').hide();
    $('#upass2').hide();
    $('#upass3').hide();
    $('#prop').css('color', 'white');
    if ($('#name2').val() && $('#email').val() && $('#pass2').val() && $('#pass3').val() && $('#file')[0].files[0]) {
      if ($('#pass2').val() === $('#pass3').val()) {
        createUser();
        $('#up').hide();
        $('#loadingSpinner').show();
      } else {
        $('#upass3').show();
        $('#upass3').text('Passwords do not match');
        $('#pass3').css('border', '2px solid red');
      }
    } else if (!$('#name2').val()) {
      $('#unames').show();
      $('#unames').text('Please enter username');
      $('#name2').css('border', '2px solid red');
    } else if (!$('#email').val()) {
      $('#uemail').show();
      $('#uemail').text('Please enter email');
      $('#email').css('border', '2px solid red');
    } else if (!$('#pass2').val()) {
      $('#upass2').show();
      $('#upass2').text('Please enter password');
      $('#pass2').css('border', '2px solid red');
    } else if (!$('#pass3').val()) {
      $('#upass3').show();
      $('#upass3').text('Please confirm password');
      $('#pass3').css('border', '2px solid red');
    } else if (!$('#file')[0].files[0]) {
      // eslint-disable-next-line no-undef
      $('#prop').css('color', 'red');
    }
  });
});
