/* eslint-disable no-alert */
/* eslint-disable no-undef */
// Get the URL query string

const queryString = window.location.search;
// Parse the query string into an object
const params = new URLSearchParams(queryString);

// Example: Get the value of a specific parameter named 'paramName'
const token = params.get('x-token');
function getMessages(name) {
  $.ajax({
    url: `/api/v1/chat/${name}?x-token=${token}`,
    type: 'GET',
    success: (response) => {
      const { messages } = response;
      $('#friend').text(name);

      $('.dp').attr('src', `/image/${name}`);
      $('.dp').attr('alt', name);

      const parent = $('.chat-container');
      parent.empty();
      if (messages) {
        for (let i = 0; i < messages.length; i += 1) {
          const msg = messages[i];
          const text = msg.message;
          const date = msg.time;
          const owner = msg.sent_by;
          if (owner === name) {
            const newMessage = $('<div class="message-box friend-message"></div>');
            newMessage.append(`<p>${text}<br><span>${date}</span></p>`);
            parent.append(newMessage);
          } else {
            const newMessage = $('<div class="message-box my-message"></div>');
            newMessage.append(`<p>${text}<br><span>${date}</span></p>`);
            parent.append(newMessage);
          }
        }
        const div = $('.chat-container');
        div.scrollTop(div[0].scrollHeight);
      }
    },
  });
}

function sendMessage(name, socket) {
  const data = {
    message: $('#message').val(),
    to: name,
  };
  $.ajax({
    url: `/api/v1/chat/${$('#friend').text()}/send?x-token=${token}`,
    type: 'POST',
    data,
    success: (response) => {
      $('#message').val('');
      const parent = $('.chat-container');
      const newMessage = $('<div class="message-box my-message"></div>');
      newMessage.append(`<p>${response.message}<br><span>${response.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
      socket.emit('send-msg', data);
    },

  });
}

$(document).ready(() => {
  const name = $('h6').text();
  const socket = io('http://localhost:8000');
  socket.emit('add-user', name);

  $('.chat-box').click((event) => {
    if ($(window).width() < 800) {
      $('.right-container').css('display', 'block');
      $('.left-container').css('display', 'none');
    }
    getMessages($(this).find('#ffriend').text());
    socket.on('msg-recieved', (data) => {
      const parent = $('.chat-container');
      const newMessage = $('<div class="message-box friend-message"></div>');
      newMessage.append(`<p>${data.mesage}<br><span>${data.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
    });
  });

  $('#send').click((event) => {
    event.preventDefault();
    if ($('#message').val()) {
      sendMessage(name, socket);
    } else {
      alert('Pls type your message');
    }
  });

  $('#posts').click(() => {
    $.ajax({
      url: '/logout',
      type: 'POST',
      success: () => {
        // Handle successful logout
        alert('Logout successful');
        window.location.href = '/';
      },
    });
  });

  $('#back').click(() => {
    if ($(window).width() < 800) {
      // Execute code for small screens
      $('.right-container').css('display', 'none');
      $('.left-container').css('display', 'block');
    } else {
      // Execute code for larger screens
      $('.right-container').empty();
      $('.right-container').append('<h2>Click on a friend to chat</h2>');
    }
  });

  $('.user-img').click(() => {
    window.location.href = `/profile/${$('h6').text()}?x-token=${token}`;
  });

  $('img-box').click(() => {
    window.location.href = `/profile/${$(this).attr('alt')}`;
  });

  $('#notif').click(() => {
    window.location.href = `/notifications?x-token=${token}`;
  });

  $('#users').click(() => {
    window.location.href = `/users?x-token=${token}`;
  });

  $('.right-container').css('display', 'none');
});
