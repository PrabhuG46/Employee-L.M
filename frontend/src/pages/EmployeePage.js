"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    department: "",
    phone: "",
    profilePhoto: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/employees");
      setEmployees(response.data);
    } catch (error) {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/employees", formData);
      setSuccess("Employee added successfully!");
      setShowModal(false);
      setFormData({
        name: "",
        role: "",
        email: "",
        department: "",
        phone: "",
        profilePhoto: "",
      });
      fetchEmployees();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add employee");
      console.error("Error adding employee:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canAddEmployee = () => {
    return user?.role === "hr" || user?.role === "admin";
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="page-header fade-in">
        <Row className="align-items-center">
          <Col>
            <h1 className="mb-0">
              <i className="fas fa-user-friends me-3"></i>
              Employee Directory
            </h1>
            <p className="text-muted mt-2 mb-0">Manage your team members</p>
          </Col>
          <Col xs="auto">
            {canAddEmployee() && (
              <Button
                className="btn-soft-primary"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Employee
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Row>
        {employees.map((employee) => (
          <Col lg={6} xl={4} key={employee._id} className="mb-4">
            <Card className="employee-card fade-in">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={employee.profilePhoto || "/placeholder.svg"}
                    alt={employee.name}
                    className="profile-img me-3"
                  />
                  <div>
                    <h5 className="mb-1">{employee.name}</h5>
                    <p className="text-muted mb-0">{employee.role}</p>
                  </div>
                </div>

                <div className="employee-details">
                  <div className="mb-2">
                    <i className="fas fa-envelope text-muted me-2"></i>
                    <small>{employee.email}</small>
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-building text-muted me-2"></i>
                    <small>{employee.department}</small>
                  </div>
                  {employee.phone && (
                    <div className="mb-2">
                      <i className="fas fa-phone text-muted me-2"></i>
                      <small>{employee.phone}</small>
                    </div>
                  )}
                  <div className="mb-0">
                    <i className="fas fa-calendar text-muted me-2"></i>
                    <small>Joined {formatDate(employee.joinDate)}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {employees.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h4>No employees found</h4>
          <p className="text-muted">
            {canAddEmployee()
              ? "Add your first employee to get started"
              : "No employees to display"}
          </p>
        </div>
      )}

      {/* Add Employee Modal - Only for HR/Admin */}
      {canAddEmployee() && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add New Employee</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control-soft"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-control-soft"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control-soft"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-control-soft"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone (Optional)</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control-soft"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Photo URL (Optional)</Form.Label>
                    <Form.Control
                      type="url"
                      name="profilePhoto"
                      value={formData.profilePhoto}
                      onChange={handleInputChange}
                      className="form-control-soft"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                className="btn-soft-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-soft-primary">
                Add Employee
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Container>
  );
};

export default EmployeePage;
