import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import messageService from '../../services/messageService';
import channelService from '../../services/channelService';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = ({ channel, onChannelUpdate, onChannelSelect }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [justJoined, setJustJoined] = useState(false); // ← NEW: Track if user just joined
  const { user } = useAuth();
  const isInitialLoad = useRef(true);


  const isMember = channel?.members?.some(
    (member) => (member._id || member).toString() === user?._id
  ) || justJoined; 

  // Reset justJoined when channel changes
  useEffect(() => {
    setJustJoined(false);
  }, [channel?._id]);

  // Fetch messages (with optional silent mode)
  const fetchMessages = useCallback(async (silent = false) => {
    if (!channel || !isMember) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');
      
      const response = await messageService.getChannelMessages(channel._id);
      setMessages(response.data || []);
      
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to load messages');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [channel, isMember]);

  // Initial load
  useEffect(() => {
    isInitialLoad.current = true;
    setMessages([]); // Clear messages when channel changes
    fetchMessages(false);
  }, [fetchMessages, channel?._id]); // ← Added channel._id dependency

  // Auto-refresh messages every 3 seconds (silently)
  useEffect(() => {
    if (!channel || !isMember) return;

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [channel, isMember, fetchMessages]);

  // Send message
  const handleSendMessage = async (content) => {
    try {
      const response = await messageService.sendMessage(channel._id, content);
      setMessages((prev) => [...prev, response.data]);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send message');
    }
  };

  // Join channel
  const handleJoinChannel = async () => {
    try {
      setJoining(true);
      setError('');
      
      // Join the channel
      await channelService.joinChannel(channel._id);
      
      
      setJustJoined(true);
      
      // Refresh channel list in sidebar
      onChannelUpdate();
      
      // Refresh the selected channel with updated members
      if (onChannelSelect) {
        // Use setTimeout to ensure state updates before fetch
        setTimeout(async () => {
          await onChannelSelect(channel);
          // After refresh, load messages
          fetchMessages(false);
        }, 100);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join channel');
      setJustJoined(false);
    } finally {
      setJoining(false);
    }
  };


  // Leave channel
const handleLeaveChannel = async () => {
  if (!window.confirm('Are you sure you want to leave this channel?')) {
    return;
  }

  try {
    setError('');
    await channelService.leaveChannel(channel._id);
    
    // Refresh channel list
    onChannelUpdate();
    
    // Clear selected channel or refresh it
    if (onChannelSelect) {
      await onChannelSelect(channel);
    }
    
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to leave channel');
  }
};



  if (!channel) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center text-muted">
          <h5>Welcome to ChatterBox!</h5>
          <p>Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex flex-column">
      {/* Channel Header */}
      {/* <div className="p-3 bg-white border-bottom shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1"># {channel.name}</h4>
            {channel.description && (
              <small className="text-muted">{channel.description}</small>
            )}
          </div>
          <div className="d-flex align-items-center">
            <Badge bg="secondary" className="me-3">
              {channel.members?.length || 0} members
            </Badge>
            {!isMember && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleJoinChannel}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Channel'}
              </Button>
            )}
          </div>
        </div>
      </div> */}

      {/* Channel Header */}
<div className="p-3 bg-white border-bottom shadow-sm">
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <h4 className="mb-1"># {channel.name}</h4>
      {channel.description && (
        <small className="text-muted">{channel.description}</small>
      )}
    </div>
    <div className="d-flex align-items-center">
      <Badge bg="secondary" className="me-3">
        {channel.members?.length || 0} members
      </Badge>
      
      {/* Show Join button if NOT a member */}
      {!isMember && (
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleJoinChannel}
          disabled={joining}
        >
          {joining ? 'Joining...' : 'Join Channel'}
        </Button>
      )}
      
      {/* Show Leave button if IS a member (and not creator) */}
      {isMember && channel.createdBy?._id !== user?._id && (
        <Button 
          variant="outline-danger" 
          size="sm" 
          onClick={handleLeaveChannel}
        >
          Leave Channel
        </Button>
      )}
      
      {/* Show badge if user is creator */}
      {isMember && channel.createdBy?._id === user?._id && (
        <Badge bg="success">Creator</Badge>
      )}
    </div>
  </div>
</div>


      {/* Messages Area */}
      <div className="flex-grow-1 position-relative" style={{ minHeight: 0 }}>
        {!isMember ? (
          <div className="h-100 d-flex align-items-center justify-content-center">
            <Card className="text-center p-4 shadow">
              <Card.Body>
                <h5>You're not a member of this channel</h5>
                <p className="text-muted">Join to view and send messages</p>
                <Button 
                  variant="primary" 
                  onClick={handleJoinChannel}
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Join Now'}
                </Button>
              </Card.Body>
            </Card>
          </div>
        ) : loading ? (
          <div className="h-100 d-flex align-items-center justify-content-center">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        ) : (
          <MessageList messages={messages} currentUserId={user?._id} />
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={!isMember} />
    </div>
  );
};

export default ChatWindow;