import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="primary" variant="dark" className="shadow-sm">
      <Container fluid>
        <BSNavbar.Brand href="#" className="fw-bold fs-4">
          💬 ChatterBox
        </BSNavbar.Brand>
        <Nav className="ms-auto align-items-center">
          <Nav.Item className="text-white me-3">
            Welcome, <strong>{user?.username}</strong>
          </Nav.Item>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;