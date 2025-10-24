import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border-top bg-light">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={disabled ? 'Join the channel to send messages' : 'Type a message...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || sending}
          maxLength={2000}
        />
        <Button 
          type="submit" 
          variant="primary" 
          disabled={disabled || sending || !message.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default MessageInput;