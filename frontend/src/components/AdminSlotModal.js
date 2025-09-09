import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';

const AdminSlotModal = ({ show, onHide, onSubmit }) => {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        slotId: ''
    });
    const [validated, setValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal is closed/opened
    React.useEffect(() => {
        if (!show) {
            setFormData({ date: '', startTime: '', endTime: '', slotId: '' });
            setValidated(false);
            setErrors({});
            setIsSubmitting(false);
        }
    }, [show]);

    // Generate slot ID automatically
    const generateSlotId = () => {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `slot-${timestamp}-${randomSuffix}`;
    };

    // Validation functions
    const validateDate = (date) => {
        if (!date) return 'Date is required';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) return 'Date cannot be in the past';
        return null;
    };

    const validateTime = (startTime, endTime) => {
        if (!startTime) return { startTime: 'Start time is required' };
        if (!endTime) return { endTime: 'End time is required' };

        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);

        if (end <= start) {
            return { endTime: 'End time must be after start time' };
        }

        const diffMinutes = (end - start) / (1000 * 60);
        if (diffMinutes < 30) {
            return { endTime: 'Slot must be at least 30 minutes long' };
        }

        if (diffMinutes > 240) {
            return { endTime: 'Slot cannot be longer than 4 hours' };
        }

        return {};
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        const dateError = validateDate(formData.date);
        if (dateError) newErrors.date = dateError;

        const timeErrors = validateTime(formData.startTime, formData.endTime);
        Object.assign(newErrors, timeErrors);

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidated(true);

        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const slotData = {
                ...formData,
                slotId: formData.slotId || generateSlotId()
            };

            await onSubmit(slotData);

            // Form will be reset by useEffect when modal closes
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to add slot. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>🔧 Add New Interview Slot</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errors.submit && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Error:</strong> {errors.submit}
                    </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formDate">
                                <Form.Label>
                                    Date <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.date}
                                    min={getMinDate()}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    isInvalid={!!errors.date}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.date || 'Please select a valid date.'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formSlotId">
                                <Form.Label>Slot ID (Optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Auto-generated if empty"
                                    value={formData.slotId}
                                    onChange={(e) => handleInputChange('slotId', e.target.value)}
                                    isInvalid={!!errors.slotId}
                                />
                                <Form.Text className="text-muted">
                                    Leave empty to auto-generate
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formStartTime">
                                <Form.Label>
                                    Start Time <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    isInvalid={!!errors.startTime}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.startTime || 'Please select start time.'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formEndTime">
                                <Form.Label>
                                    End Time <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                    isInvalid={!!errors.endTime}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.endTime || 'Please select end time.'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Alert variant="info" className="mb-3">
                        <strong>Guidelines:</strong>
                        <ul className="mb-0 mt-2">
                            <li>Slots must be at least 30 minutes long</li>
                            <li>Maximum slot duration is 4 hours</li>
                            <li>Date cannot be in the past</li>
                            <li>Slot ID will be auto-generated if not provided</li>
                        </ul>
                    </Alert>

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            <span className="text-danger">*</span> Required fields
                        </div>
                        <div>
                            <Button
                                variant="outline-secondary"
                                onClick={onHide}
                                className="me-2"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Adding...
                                    </>
                                ) : (
                                    '➕ Add Slot'
                                )}
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdminSlotModal;
