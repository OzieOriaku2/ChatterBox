import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import Navbar from '../components/Layout/Navbar';
import ChannelList from '../components/Channels/ChannelList';
import CreateChannelModal from '../components/Channels/CreateChannelModal';
import ChatWindow from '../components/Chat/ChatWindow';
import channelService from '../services/channelService';

const DashboardPage = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await channelService.getAllChannels();
      setChannels(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Create new channel
  const handleCreateChannel = async (channelData) => {
    const response = await channelService.createChannel(channelData);
    setChannels((prev) => [...prev, response.data]);
    setSelectedChannel(response.data);
  };

  // Select channel
  const handleSelectChannel = async (channel) => {
    try {
      // Fetch fresh channel data with populated members
      const response = await channelService.getChannelById(channel._id);
      setSelectedChannel(response.data);
    } catch (err) {
      console.error('Failed to load channel:', err);
      setSelectedChannel(channel); // Fallback to cached data
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      
      <Container fluid className="flex-grow-1 overflow-hidden">
        {error && (
          <Alert variant="danger" className="m-3" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Row className="h-100 g-0">
          {/* Sidebar - Channel List */}
          <Col md={3} lg={3} className="border-end bg-white" style={{ height: 'calc(100vh - 56px)' }}>
            <ChannelList
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              onCreateChannel={() => setShowCreateModal(true)}
              loading={loading}
              error={error}
            />
          </Col>

          {/* Main - Chat Window */}
          <Col md={9} lg={9} style={{ height: 'calc(100vh - 56px)' }}>
            <ChatWindow 
              channel={selectedChannel} 
              onChannelUpdate={fetchChannels}
            />
          </Col>
        </Row>
      </Container>

      {/* Create Channel Modal */}
      <CreateChannelModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  );
};

export default DashboardPage;