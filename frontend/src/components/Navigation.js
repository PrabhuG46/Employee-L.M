"use client"

import { Navbar, Nav, Container, Dropdown } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { useAuth } from "../contexts/AuthContext"

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Navbar expand="lg" className="navbar-soft">
      <Container>
        <Navbar.Brand href="/employees">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/005/425/371/small_2x/em-me-logo-design-template-graphic-branding-element-free-vector.jpg"
            alt="Logo"
            width="32"
            height="32"
            className="me-2 rounded-circle"
          />
          Employee Management
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/employees">
              <Nav.Link>
                <i className="fas fa-user-friends me-1"></i>
                Employees
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/leave-requests">
              <Nav.Link>
                <i className="fas fa-calendar-alt me-1"></i>
                Leave Requests
              </Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="nav-link d-flex align-items-center text-decoration-none border-0 bg-transparent"
                id="user-dropdown"
              >
                <span className="d-none d-md-inline">{user?.name}</span>
                <i className="fas fa-chevron-down ms-2"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="soft-card border-0">
                <Dropdown.Header>
                  <div className="d-flex align-items-center">
                   
                    <div>
                      <div className="fw-bold">{user?.name}</div>
                      <small className="text-muted">{user?.role}</small>
                    </div>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item>
                  <i className="fas fa-user me-2"></i>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="fas fa-cog me-2"></i>
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation
