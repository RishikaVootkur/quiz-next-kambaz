/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAssignment, updateAssignment, setAssignments } from "../reducer";
import { RootState } from "../../../../store";
import * as client from "../client";

export default function AssignmentEditor() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const cid = params.cid as string;
  const aid = params.aid as string;
  
  const { assignments } = useSelector((state: RootState) => state.assignmentsReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const assignment = assignments.find((a: any) => a._id === aid);
  
  const [formData, setFormData] = useState({
    title: "New Assignment",
    description: "New Assignment Description",
    points: 100,
    dueDate: "2025-05-13",
    availableFrom: "2025-05-06",
    availableUntil: "2025-05-20",
  });

  useEffect(() => {
    if (assignment && aid !== "new") {
      setFormData({
        title: assignment.title || "New Assignment",
        description: assignment.description || "New Assignment Description",
        points: assignment.points || 100,
        dueDate: assignment.dueDate || "2025-05-13",
        availableFrom: assignment.availableFrom || "2025-05-06",
        availableUntil: assignment.availableUntil || "2025-05-20",
      });
    }
  }, [assignment, aid]);

  const handleSave = async () => {
    try {
      if (aid === "new") {
        const newAssignment = await client.createAssignmentForCourse(cid, formData);
        dispatch(addAssignment(newAssignment));
      } else {
        const updatedAssignment = await client.updateAssignment({ ...formData, _id: aid, course: cid });
        dispatch(updateAssignment(updatedAssignment));
      }
      router.push(`/Courses/${cid}/Assignments`);
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Assignments`);
  };

  return (
    <div id="wd-assignments-editor" className="container mt-4">
      <div className="mx-auto" style={{ maxWidth: "800px" }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="wd-name">Assignment Name</Form.Label>
            <Form.Control
              type="text"
              id="wd-name"
              value={formData.title}
              disabled={!isFaculty}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="wd-description">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              id="wd-description"
              value={formData.description}
              disabled={!isFaculty}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>

          <Row className="mb-3 align-items-center">
            <Col sm={3}>
              <Form.Label htmlFor="wd-points" className="text-end d-block mb-0">
                Points
              </Form.Label>
            </Col>
            <Col sm={9}>
              <Form.Control
                type="number"
                id="wd-points"
                value={formData.points}
                disabled={!isFaculty}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              />
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col sm={3}>
              <Form.Label htmlFor="wd-group" className="text-end d-block mb-0">
                Assignment Group
              </Form.Label>
            </Col>
            <Col sm={9}>
              <Form.Select id="wd-group" disabled={!isFaculty}>
                <option value="ASSIGNMENTS">ASSIGNMENTS</option>
                <option value="QUIZZES">QUIZZES</option>
                <option value="EXAMS">EXAMS</option>
                <option value="PROJECT">PROJECT</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col sm={3}>
              <Form.Label htmlFor="wd-display-grade-as" className="text-end d-block mb-0">
                Display Grade as
              </Form.Label>
            </Col>
            <Col sm={9}>
              <Form.Select id="wd-display-grade-as" disabled={!isFaculty}>
                <option value="Percentage">Percentage</option>
                <option value="Points">Points</option>
                <option value="Letter Grade">Letter Grade</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3 align-items-start">
            <Col sm={3}>
              <Form.Label htmlFor="wd-submission-type" className="text-end d-block mb-0 mt-2">
                Submission Type
              </Form.Label>
            </Col>
            <Col sm={9}>
              <div className="border p-3 rounded">
                <Form.Select id="wd-submission-type" className="mb-3" disabled={!isFaculty}>
                  <option value="Online">Online</option>
                  <option value="Paper">Paper</option>
                  <option value="External Tool">External Tool</option>
                </Form.Select>

                <div className="ms-3">
                  <Form.Label className="fw-bold mb-2">Online Entry Options</Form.Label>
                  
                  <Form.Check
                    type="checkbox"
                    id="wd-text-entry"
                    label="Text Entry"
                    className="mb-1"
                    disabled={!isFaculty}
                  />
                  <Form.Check
                    type="checkbox"
                    id="wd-website-url"
                    label="Website URL"
                    className="mb-1"
                    disabled={!isFaculty}
                  />
                  <Form.Check
                    type="checkbox"
                    id="wd-media-recordings"
                    label="Media Recordings"
                    className="mb-1"
                    disabled={!isFaculty}
                  />
                  <Form.Check
                    type="checkbox"
                    id="wd-student-annotation"
                    label="Student Annotation"
                    className="mb-1"
                    disabled={!isFaculty}
                  />
                  <Form.Check
                    type="checkbox"
                    id="wd-file-upload"
                    label="File Uploads"
                    disabled={!isFaculty}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row className="mb-3 align-items-start">
            <Col sm={3}>
              <Form.Label className="text-end d-block mb-0 mt-2">
                Assign
              </Form.Label>
            </Col>
            <Col sm={9}>
              <div className="border p-3 rounded">
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="wd-assign-to" className="fw-bold">
                    Assign to
                  </Form.Label>
                  <Select
                    inputId="wd-assign-to"
                    placeholder="Select..."
                    classNamePrefix="assign"
                    isMulti
                    closeMenuOnSelect={false}
                    isDisabled={!isFaculty}
                    defaultValue={[{ value: "students", label: "Students" }]}
                    options={[
                      { value: "everyone", label: "Everyone" },
                      { value: "students", label: "Students only" },
                      { value: "tas", label: "TA's" },
                      { value: "professors", label: "Professor's"},
                    ]}
                    styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="wd-due-date" className="fw-bold">
                    Due
                  </Form.Label>
                  <Form.Control
                    type="date"
                    id="wd-due-date"
                    value={formData.dueDate}
                    disabled={!isFaculty}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="wd-available-from" className="fw-bold">
                        Available from
                      </Form.Label>
                      <Form.Control
                        type="date"
                        id="wd-available-from"
                        value={formData.availableFrom}
                        disabled={!isFaculty}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="wd-available-until" className="fw-bold">
                        Until
                      </Form.Label>
                      <Form.Control
                        type="date"
                        id="wd-available-until"
                        value={formData.availableUntil}
                        disabled={!isFaculty}
                        onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <hr />
          {isFaculty && (
            <div className="d-flex justify-content-end mt-3 mb-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}