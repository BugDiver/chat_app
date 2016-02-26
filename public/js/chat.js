// This file is executed in the browser, when people visit /chat/<random id>

var name = "",friend = "";

	// collect some jQuery objects of login user
var section = $(".section"),
	footer = $("footer"),
	onConnect = $(".connected"),
	inviteSomebody = $(".invite-textfield"),
	personInside = $(".personinside"),
	chatScreen = $(".chatscreen"),
	left = $(".left"),
	noMessages = $(".nomessages"),
	tooManyPeople = $(".toomanypeople");

// some more jquery objects of chating user
var chatNickname = $(".nickname-chat"),
	leftNickname = $(".nickname-left"),
	loginForm = $(".loginForm"),
	yourName = $("#yourName"),
	hisName = $("#hisName"),
	chatForm = $("#chatform"),
	textarea = $("#message"),
	messageTimeSent = $(".timesent"),
	chats = $(".chats");


//==========================================================================


var showMessage = function(status,data){
	if(status === "connected"){
		section.children().css('display', 'none');
		footer.css('display', 'none');
		onConnect.fadeIn(1200);
	}
	else if(status === "inviteSomebody"){
		$("#link").text(window.location.href);
		onConnect.fadeOut(1200, function(){
			inviteSomebody.fadeIn(1200);
		});
	}
	else if(status === "personinchat"){
		onConnect.css("display", "none");
		footer.css('display', 'none');
		personInside.fadeIn(1200);
		chatNickname.text(data.user);
	}
	else if(status === "youStartedChatWithNoMessages") {
		left.fadeOut(1200, function() {
			inviteSomebody.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});
		});
		friend = data.users[1];
	}
	else if(status === "heStartedChatWithNoMessages") {
		personInside.fadeOut(1200,function(){
			noMessages.fadeIn(1200);
			footer.fadeIn(1200);
		});
		friend = data.users[0];
	}
	else if(status === "chatStarted"){
		section.children().css('display','none');
		chatScreen.css('display','block');
	}
	else if(status === "somebodyLeft"){
		leftImage.attr("src",data.avatar);
		leftNickname.text(data.user);
		section.children().css('display','none');
		footer.css('display', 'none');
		left.fadeIn(1200);
	}
	else if(status === "tooManyPeople") {
		section.children().css('display', 'none');
		tooManyPeople.fadeIn(1200);
	}
}


//====================================================================================================


$(function(){

	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// connect to the socket
	var socket = io.connect('/socket');

	// on connection to server get the id of person's room
	socket.on('connect', function(){
		socket.emit('load', id);
	});

	socket.on('peopleinchat', function(data){

		if(data.number === 0){

			showMessage("connected");

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(yourName.val());

				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}
				showMessage("inviteSomebody");
				// call the server-side function 'login' and send user's parameters
				socket.emit('login', {user: name,id: id});

			});
		}

		else if(data.number === 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				if(name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}
				socket.emit('login', {user: name, avatar: email, id: id});

			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});

	// Other useful

	socket.on('startChat', function(data){
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){

			showMessage('chatStarted');

			createChatMessage(data.msg, data.user, moment());
			scrollToBottom();
	});

	textarea.keypress(function(e){
		if(textarea.val() != ""){
				if(e.which == 13) {
					e.preventDefault();
					chatForm.trigger('submit');
				}
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		createChatMessage(textarea.val(), name,moment());
		scrollToBottom();

		// Send the message to the other person in the chat
		socket.emit('msg', {msg: textarea.val(), user: name});

		// Empty the textarea
		textarea.val("");

	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message

	function createChatMessage(msg,user,now){
		var who = '';
		if(user===name)
			who = 'me';
		else
			who = 'you';

		var li = $('<li class=' + who + '>'+
						'<div class="image">' +'<b></b>' +
							'<i class="timesent" data-time=' + now + '></i> ' +
						'</div>' +
						'<p></p>' +
					'</li>');

		li.find('p').text(msg);
		li.find('b').text(user);
		chats.append(li);

		$(".timesent").last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}
});
