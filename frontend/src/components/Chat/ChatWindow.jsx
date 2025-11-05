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

    {/* Channel Header - RESPONSIVE */}
    <div className="p-2 p-md-3 bg-white border-bottom shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        {/* Channel Info */}
        <div className="flex-grow-1">
          <h4 className="mb-1 fs-5 fs-md-4"># {channel.name}</h4>
          {channel.description && (
            <small className="text-muted d-none d-md-block">{channel.description}</small>
          )}
        </div>
        
        {/* Action Buttons - Responsive */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Badge bg="secondary" className="px-2 py-1">
            {channel.members?.length || 0} {channel.members?.length === 1 ? 'member' : 'members'}
          </Badge>
          
          {!isMember && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleJoinChannel}
              disabled={joining}
              className="text-nowrap"
            >
              {joining ? 'Joining...' : 'Join Channel'}
            </Button>
          )}
          
          {isMember && channel.createdBy?._id !== user?._id && (
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={handleLeaveChannel}
              className="text-nowrap"
            >
              Leave
            </Button>
          )}
          
          {isMember && channel.createdBy?._id === user?._id && (
            <Badge bg="success" className="px-2 py-1">
              Creator
            </Badge>
          )}
        </div>
      </div>
    </div>

    {/* Messages Area */}
    <div className="flex-grow-1 position-relative" style={{ minHeight: 0 }}>
      {!isMember ? (
        // RESPONSIVE Modal for Non-Members
        <div className="h-100 d-flex align-items-center justify-content-center p-3">
          <Card className="text-center shadow w-100" style={{ maxWidth: '400px' }}>
            <Card.Body className="p-3 p-md-4">
              <div className="mb-3">
                <div 
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e9ecef' 
                  }}
                >
                  <span style={{ fontSize: '30px' }}>🔒</span>
                </div>
                <h5 className="mb-2 fs-6 fs-md-5">You're not a member of this channel</h5>
                <p className="text-muted mb-0 small">
                  Join to view and send messages
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={handleJoinChannel}
                disabled={joining}
                className="w-100"
                size="lg"
              >
                {joining ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Joining...
                  </>
                ) : (
                  '✓ Join Now'
                )}
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