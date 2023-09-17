/* eslint-disable no-undef */
// Get the URL query string
const queryString = window.location.search;

// Parse the query string into an object
const params = new URLSearchParams(queryString);

// Example: Get the value of a specific parameter named 'paramName'
const token = params.get('x-token');
function get_messages(name) {
  $.ajax({
    url: `/api/v1/chat/${name}?x-token=${token}`,
    type: 'GET',
    success: function(response) {
      const messages = response.messages;
      $('#friend').text(name)

      $('.dp').attr('src', "/image/"+name);
      $('.dp').attr('alt', name);

      const parent = $('.chat-container')
      parent.empty();
      if (messages) {
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          const text = message['body'];
          const date = message['time'];
          const owner = message['sent_by'];
          
          if (owner == name) {
            const new_message = $('<div class="message-box friend-message"></div>')
            new_message.append('<p>' + text + '<br><span>' + date + '</span></p>');
            parent.append(new_message)
          } else {
            const new_message = $('<div class="message-box my-message"></div>')
            new_message.append('<p>' + text + '<br><span>' + date + '</span></p>');
            parent.append(new_message)
          }
        }
        const div = $('.chat-container');
        div.scrollTop(div[0].scrollHeight)
      }
    }
  });
}

function send_message (name) {
  const data = {
    'message': $('#message').val(),
  };
  $.ajax ({
    url: `/api/v1/chat/${$('#friend').text()}/send?x-token=${token}`,
    type: 'POST',
    data: data,
    success: function(response) {
      $('#message').val('')
      const parent = $('.chat-container')
      const new_message = $('<div class="message-box my-message"></div>')
      new_message.append('<p>' + response.message+ '<br><span>' + response.time + '</span></p>');
      parent.append(new_message)
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight)

    }

  })
}

$(document).ready(function() {
  const name = $('h6').text();


  
  $('.chat-box').click(function (event) {
    if ($(window).width() < 800) {
      $('.right-container').css('display', 'block');
      $('.left-container').css('display', 'none');
    }
    get_messages($(this).find('#ffriend').text())
    socket.on('connection', (socket) => {
      // Handle real-time events here
      console.log('Connected');
    });
    socket.on('msg-recieved', function(data){
      if (data['sent_by'] == $('#friend').text()) {
        const parent = $('.chat-container')
        const new_message = $('<div class="message-box friend-message"></div>')
        new_message.append('<p>' + data['body'] + '<br><span>' + data['time'] + '</span></p>');
        parent.append(new_message)
        const div = $('.chat-container');
        div.scrollTop(div[0].scrollHeight)
      }
    });
  });

  $("#send").click( function(event) {
    event.preventDefault();
    if ($('#message').val()) {
      send_message(name)
    } else{
      alert('Pls type your message');
    }
  });

  $('#posts').click(function() {
    $.ajax({
      url: '/logout',
      type: 'POST',
      success: function(response) {
        // Handle successful logout
        alert('Logout successful');
        window.location.href = '/';
      }
    });
  });

  $('#back').click(function() {
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

  $('.user-img').click(function() {
    window.location.href = '/profile/' + $('h6').text() + `?x-token=${token}`;
  });

  $('img-box').click(function() {
    window.location.href = '/profile/' + $(this).attr('alt');
  });

  $('#notif').click(function(event) {
    window.location.href = `/notifications?x-token=${token}`;
  });

  $('#users').click(function(event){
    window.location.href = `/users?x-token=${token}`;
  });
  

  $('.right-container').css('display','none')

});