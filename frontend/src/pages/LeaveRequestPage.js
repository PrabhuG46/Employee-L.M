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
  Badge,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const LeaveRequestPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchEmployees();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/leave-requests");
      setLeaveRequests(response.data);
    } catch (error) {
      setError("Failed to fetch leave requests");
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError("From date cannot be later than to date");
      return;
    }

    // Validate required fields
    if (
      !formData.employeeId ||
      !formData.fromDate ||
      !formData.toDate ||
      !formData.reason
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      console.log("Submitting leave request:", formData); // Debug log
      const response = await axios.post("/api/leave-requests", formData);
      console.log("Leave request created:", response.data); // Debug log

      setSuccess("Leave request submitted successfully!");
      setShowModal(false);
      setFormData({
        employeeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      fetchLeaveRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error submitting leave request:", error.response || error);
      setError(
        error.response?.data?.message || "Failed to submit leave request"
      );
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError("From date cannot be later than to date");
      return;
    }

    try {
      await axios.put(`/api/leave-requests/${editingRequest._id}`, {
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
      });
      setSuccess("Leave request updated successfully!");
      setShowEditModal(false);
      setEditingRequest(null);
      setFormData({
        employeeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      fetchLeaveRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update leave request"
      );
      console.error("Error updating leave request:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/leave-requests/${id}`, { status });
      setSuccess(`Leave request ${status} successfully!`);
      fetchLeaveRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update leave request"
      );
      console.error("Error updating leave request:", error);
    }
  };

  const deleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await axios.delete(`/api/leave-requests/${id}`);
        setSuccess("Leave request deleted successfully!");
        fetchLeaveRequests();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to delete leave request"
        );
        console.error("Error deleting leave request:", error);
      }
    }
  };

  const openEditModal = (request) => {
    setEditingRequest(request);
    setFormData({
      employeeId: request.employeeId._id,
      fromDate: new Date(request.fromDate).toISOString().split("T")[0],
      toDate: new Date(request.toDate).toISOString().split("T")[0],
      reason: request.reason,
    });
    setShowEditModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "warning", className: "status-pending" },
      approved: { variant: "success", className: "status-approved" },
      rejected: { variant: "danger", className: "status-rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={`status-badge ${config.className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const canEditRequest = (request) => {
    return (
      user?.role === "employee" &&
      request.submittedBy._id === user.id &&
      request.status === "pending" &&
      !request.isEdited
    );
  };

  const canDeleteRequest = (request) => {
    return (
      (user?.role === "employee" &&
        request.submittedBy._id === user.id &&
        request.status === "pending") ||
      user?.role === "admin"
    );
  };

  const canApproveReject = () => {
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
              <i className="fas fa-calendar-alt me-3"></i>
              Leave Requests
            </h1>
            <p className="text-muted mt-2 mb-0">
              {user?.role === "employee"
                ? "Manage your leave applications"
                : "Manage employee leave applications"}
            </p>
          </Col>
          <Col xs="auto">
            {(user?.role === "employee" ||
              user?.role === "hr" ||
              user?.role === "admin") && (
              <Button
                className="btn-soft-primary"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                New Request
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
        {leaveRequests.map((request) => (
          <Col lg={6} xl={4} key={request._id} className="mb-4">
            <Card className="soft-card fade-in">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        request.employeeId?.profilePhoto ||
                        "https://via.placeholder.com/50x50/e3f2fd/1976d2?text=E"
                      }
                      alt={request.employeeId?.name}
                      className="rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="mb-1">{request.employeeId?.name}</h6>
                      <small className="text-muted">
                        {request.employeeId?.role}
                      </small>
                      {request.isEdited && (
                        <div>
                          <Badge bg="info" className="mt-1">
                            <i className="fas fa-edit me-1"></i>
                            Edited
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      <i className="fas fa-calendar-day me-1"></i>
                      From:
                    </span>
                    <span>{formatDate(request.fromDate)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      <i className="fas fa-calendar-day me-1"></i>
                      To:
                    </span>
                    <span>{formatDate(request.toDate)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      Duration:
                    </span>
                    <span>
                      {calculateDays(request.fromDate, request.toDate)} days
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">Reason:</h6>
                  <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                    {request.reason}
                  </p>
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    Applied on {formatDate(request.appliedDate)}
                    {request.submittedBy && (
                      <span> by {request.submittedBy.name}</span>
                    )}
                  </small>
                  {request.approvedBy && (
                    <div>
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Approved by {request.approvedBy.name} on{" "}
                        {formatDate(request.approvedDate)}
                      </small>
                    </div>
                  )}
                  {request.rejectedBy && (
                    <div>
                      <small className="text-danger">
                        <i className="fas fa-times me-1"></i>
                        Rejected by {request.rejectedBy.name} on{" "}
                        {formatDate(request.rejectedDate)}
                      </small>
                    </div>
                  )}
                </div>

                {/* Action buttons based on role and request status */}
                <div className="d-flex gap-2 flex-wrap">
                  {/* HR/Admin approval buttons */}
                  {request.status === "pending" && canApproveReject() && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateStatus(request._id, "approved")}
                        className="flex-fill"
                      >
                        <i className="fas fa-check me-1"></i>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateStatus(request._id, "rejected")}
                        className="flex-fill"
                      >
                        <i className="fas fa-times me-1"></i>
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Employee edit/delete buttons */}
                  {canEditRequest(request) && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => openEditModal(request)}
                      className="flex-fill"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Button>
                  )}

                  {canDeleteRequest(request) && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => deleteRequest(request._id)}
                      className="flex-fill"
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {leaveRequests.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <h4>No leave requests found</h4>
          <p className="text-muted">
            {user?.role === "employee"
              ? "Submit your first leave request to get started"
              : "No leave requests to review"}
          </p>
        </div>
      )}

      {/* Add Leave Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Leave Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="form-control-soft"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    className="form-control-soft"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    className="form-control-soft"
                    min={
                      formData.fromDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason for Leave</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-control-soft"
                placeholder="Please provide a detailed reason for your leave request..."
                required
              />
            </Form.Group>

            {formData.fromDate && formData.toDate && (
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                Total leave duration:{" "}
                {calculateDays(formData.fromDate, formData.toDate)} days
              </Alert>
            )}
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
              Submit Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Leave Request Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Leave Request
            <Badge bg="warning" className="ms-2">
              One-time edit only
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Note:</strong> You can only edit this leave request once.
              After editing, no further changes will be allowed.
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Control
                type="text"
                value={
                  editingRequest?.employeeId?.name +
                  " - " +
                  editingRequest?.employeeId?.role
                }
                className="form-control-soft"
                disabled
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    className="form-control-soft"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    className="form-control-soft"
                    min={
                      formData.fromDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason for Leave</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-control-soft"
                placeholder="Please provide a detailed reason for your leave request..."
                required
              />
            </Form.Group>

            {formData.fromDate && formData.toDate && (
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                Total leave duration:{" "}
                {calculateDays(formData.fromDate, formData.toDate)} days
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              className="btn-soft-secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-soft-primary">
              Update Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default LeaveRequestPage;
