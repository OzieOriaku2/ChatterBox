import { ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';

const ChannelList = ({ 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  onCreateChannel,
  loading,
  error 
}) => {
  return (
    <div className="h-100 d-flex flex-column">
      <div className="p-3 bg-light border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Channels</h5>
          <Button variant="primary" size="sm" onClick={onCreateChannel}>
            + New
          </Button>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {loading && (
          <div className="text-center p-4">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        )}

        {!loading && !error && channels.length === 0 && (
          <div className="text-center text-muted p-4">
            <p>No channels yet.</p>
            <p className="small">Create one to get started!</p>
          </div>
        )}

        {!loading && channels.length > 0 && (
          <ListGroup variant="flush">
            {channels.map((channel) => (
              <ListGroup.Item
                key={channel._id}
                action
                active={selectedChannel?._id === channel._id}
                onClick={() => onSelectChannel(channel)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold"># {channel.name}</div>
                  {channel.description && (
                    <small className="text-muted">{channel.description}</small>
                  )}
                </div>
                <Badge bg="secondary" pill>
                  {channel.members?.length || 0}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default ChannelList;