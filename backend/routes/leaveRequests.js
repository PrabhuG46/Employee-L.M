const express = require("express");
const router = express.Router();
const LeaveRequest = require("../models/LeaveRequest");
const { authenticateToken } = require("../middleware/auth");

// Get all leave requests (HR and Admin can see all, employees see only their own)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = {};

    // If user is employee, only show their requests
    if (req.user.role === "employee") {
      query.submittedBy = req.user._id;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employeeId", "name role email")
      .populate("submittedBy", "name email role")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave requests by employee
router.get("/employee/:employeeId", authenticateToken, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      employeeId: req.params.employeeId,
    })
      .populate("employeeId", "name role email")
      .populate("submittedBy", "name email role")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new leave request
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Ensure submittedBy is set to the authenticated user
    const leaveRequestData = {
      ...req.body,
      submittedBy: req.user._id,
    };

    const leaveRequest = new LeaveRequest(leaveRequestData);
    const savedLeaveRequest = await leaveRequest.save();

    const populatedRequest = await LeaveRequest.findById(savedLeaveRequest._id)
      .populate("employeeId", "name role email")
      .populate("submittedBy", "name email role");

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update leave request (Edit by employee or approve/reject by HR/Admin)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check if user is trying to approve/reject (HR/Admin only)
    if (req.body.status && req.body.status !== "pending") {
      if (req.user.role !== "hr" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            message:
              "Only HR managers and admins can approve/reject leave requests",
          });
      }

      // Update approval/rejection info
      if (req.body.status === "approved") {
        leaveRequest.approvedBy = req.user._id;
        leaveRequest.approvedDate = new Date();
      } else if (req.body.status === "rejected") {
        leaveRequest.rejectedBy = req.user._id;
        leaveRequest.rejectedDate = new Date();
      }

      leaveRequest.status = req.body.status;
    } else {
      // Check if user is trying to edit their own request
      if (leaveRequest.submittedBy.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You can only edit your own leave requests" });
      }

      // Check if request is still pending
      if (leaveRequest.status !== "pending") {
        return res
          .status(400)
          .json({
            message:
              "Cannot edit a leave request that has already been processed",
          });
      }

      // Check if already edited once
      if (leaveRequest.isEdited) {
        return res
          .status(400)
          .json({ message: "Leave request can only be edited once" });
      }

      // Store original data before editing
      leaveRequest.originalData = {
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate,
        reason: leaveRequest.reason,
      };

      // Update with new data
      leaveRequest.fromDate = req.body.fromDate || leaveRequest.fromDate;
      leaveRequest.toDate = req.body.toDate || leaveRequest.toDate;
      leaveRequest.reason = req.body.reason || leaveRequest.reason;
      leaveRequest.isEdited = true;
      leaveRequest.editedDate = new Date();
    }

    await leaveRequest.save();

    const updatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate("employeeId", "name role email")
      .populate("submittedBy", "name email role")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email");

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete leave request (Employee can delete their own pending requests)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check if user owns the request or is admin
    if (
      leaveRequest.submittedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own leave requests" });
    }

    // Check if request is still pending
    if (leaveRequest.status !== "pending") {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete a leave request that has already been processed",
        });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
