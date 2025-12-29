// Protocol types shared between frontend and backend
// WebSocket message types
export var MessageType;
(function (MessageType) {
  MessageType['JOIN'] = 'join';
  MessageType['LEAVE'] = 'leave';
  MessageType['PLAYER_JOINED'] = 'player_joined';
  MessageType['PLAYER_LEFT'] = 'player_left';
  MessageType['ROOM_STATE'] = 'room_state';
  MessageType['ERROR'] = 'error';
})(MessageType || (MessageType = {}));
