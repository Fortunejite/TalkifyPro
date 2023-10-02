/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
// Get the URL query string

const queryString = window.location.search;
// Parse the query string into an object
const params = new URLSearchParams(queryString);

// Example: Get the value of a specific parameter named 'paramName'
const token = params.get('x-token');

function sendMessage(name, id, socket) {
  const date = new Date();
  const data = {
    message: $('#message').val(),
    time: date.toDateString(),
    to: $('#friend').text(),
    sender: name,
  };
  $.ajax({
    url: `/api/v1/groupchat/${id}/send?x-token=${token}`,
    type: 'POST',
    data,
    success: function (response) {
      $('#message').val('');
      const parent = $('.chat-container');
      const newMessage = $('<div class="message-box my-message"></div>');
      newMessage.append(`<h4>{{ response.sent_by }}</h4><p>${response.message}<br><span>${response.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
      socket.emit('send-msg', data);
    },

  });
}

$(document).ready(function () {
  const name = $('h6').text();
  const div = $('.chat-container');
  div.scrollTop(div[0].scrollHeight);
  const id = $('.dp').attr('alt');
  const socket = io('http://localhost:8000');
  socket.emit('add-user', name);
  socket.on('msg-recieved', (data) => {
    if (data.sender === $('#friend').text()) {
      const parent = $('.chat-container');
      const newMessage = $('<div class="message-box friend-message"></div>');
      newMessage.append(`<p>${data.message}<br><span>${data.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
    }
  });

  $('#send').click(function (event) {
    event.preventDefault();
    if ($('#message').val()) {
      sendMessage(name, id, socket);
    } else {
      alert('Pls type your message');
    }
  });

  $('#back').click(function () {
    window.location.href = `/?x-token=${token}&activeTab=2`;
  });

  $('.user-img').click(function () {
    window.location.href = `/groupinfo/${$('.dp').attr('alt')}?x-token=${token}`;
  });
});
