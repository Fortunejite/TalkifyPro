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
function getMessages(name) {
  $.ajax({
    url: `/api/v1/chat/${name}?x-token=${token}`,
    type: 'GET',
    success: function (response) {
      const messages = response.msg;
      $('#friend').text(name);
      if (response.isActive) {
        $('#stats').text('Online');
      } else {
        $('#stats').text('Offline');
      }
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
  const date = new Date();
  const data = {
    message: $('#message').val(),
    time: date.toDateString(),
    to: $('#friend').text(),
  };
  $.ajax({
    url: `/api/v1/chat/${$('#friend').text()}/send?x-token=${token}`,
    type: 'POST',
    data,
    success: function (response) {
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

$(document).ready(function () {
  const name = $('h6').text();
  const socket = io('http://localhost:8000');
  socket.emit('add-user', name);

  // eslint-disable-next-line no-unused-vars
  $('.chat-box').click(function (event) {
    if ($(window).width() < 800) {
      $('.right-container').css('display', 'block');
      $('.left-container').css('display', 'none');
    } else {
      $('.right-container').css('display', 'block');
    }
    getMessages($(this).find('#ffriend').text());
    socket.on('msg-recieved', (data) => {
      const parent = $('.chat-container');
      const newMessage = $('<div class="message-box friend-message"></div>');
      newMessage.append(`<p>${data.message}<br><span>${data.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
    });
  });

  $('#send').click(function (event) {
    event.preventDefault();
    if ($('#message').val()) {
      sendMessage(name, socket);
    } else {
      alert('Pls type your message');
    }
  });

  $('#posts').click(function () {
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

  $('#back').click(function () {
    if ($(window).width() < 800) {
      // Execute code for small screens
      $('.right-container').css('display', 'none');
      $('.left-container').css('display', 'block');
    } else {
      // Execute code for larger screens
      const rightContainer = $('.right-container');
      rightContainer.empty();
      rightContainer.append('<h2>Click on a friend to chat</h2>');
      rightContainer.css('display', 'block');
    }
  });

  $('.user-img').click(function () {
    window.location.href = `/profile/${$('h6').text()}?x-token=${token}`;
  });

  $('img-box').click(function () {
    window.location.href = `/profile/${$(this).attr('alt')}`;
  });

  $('#notif').click(function () {
    window.location.href = `/notifications?x-token=${token}`;
  });

  $('#users').click(function () {
    window.location.href = `/users?x-token=${token}`;
  });

  $('.right-container').css('display', 'none');
});
