import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const CreateChannelModal = ({ show, onHide, onCreateChannel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onCreateChannel(formData);
      setFormData({ name: '', description: '' });
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Channel</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Channel Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="e.g. general, random, announcements"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
            />
            <Form.Text className="text-muted">
              2-50 characters, must be unique
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="What is this channel about?"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Channel'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateChannelModal;