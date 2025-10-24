import { useEffect, useRef } from 'react';
import { Card, Badge } from 'react-bootstrap';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
        <div className="text-center">
          <p className="fs-5">No messages yet</p>
          <p className="small">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 overflow-auto h-100">
      {messages.map((message) => {
        const isOwnMessage = message.sender?._id === currentUserId;
        
        return (
          <div
            key={message._id}
            className={`mb-3 d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <Card
              className={`${
                isOwnMessage ? 'bg-primary text-white' : 'bg-light'
              }`}
              style={{ maxWidth: '70%' }}
            >
              <Card.Body className="p-2 px-3">
                <div className="d-flex align-items-center mb-1">
                  <strong className="me-2">
                    {isOwnMessage ? 'You' : message.sender?.username || 'Unknown'}
                  </strong>
                  <small className={isOwnMessage ? 'text-white-50' : 'text-muted'}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>
                <div>{message.content}</div>
              </Card.Body>
            </Card>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;