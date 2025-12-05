"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Form, Badge, Dropdown, Modal } from "react-bootstrap";
import { BsThreeDotsVertical, BsCalendar3, BsTypeBold, BsTypeItalic, BsTypeUnderline } from "react-icons/bs";
import * as client from "../../client";

export default function QuizDetailsEditor({ 
  quiz, 
  setQuiz 
}: { 
  quiz: any; 
  setQuiz: (quiz: any) => void;
}) {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignees, setAssignees] = useState<string[]>(["Everyone"]);
  const [fontSize, setFontSize] = useState("12pt");
  const [textFormat, setTextFormat] = useState("Paragraph");

  useEffect(() => {
    if (quiz?.assignTo && quiz.assignTo.length > 0) {
      setAssignees(quiz.assignTo);
    }
  }, [quiz]);

  const handleSave = async () => {
    try {
      const updatedQuiz = { ...quiz, assignTo: assignees };
      await client.updateQuiz(updatedQuiz);
      router.push(`/Courses/${cid}/Quizzes/${qid}`);
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleSaveAndPublish = async () => {
    try {
      const updatedQuiz = { ...quiz, published: true, assignTo: assignees };
      await client.updateQuiz(updatedQuiz);
      await client.publishQuiz(qid);
      router.push(`/Courses/${cid}/Quizzes`);
    } catch (error) {
      console.error("Error saving and publishing quiz:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Quizzes`);
  };

  const handleRemoveAssignee = (assignee: string) => {
    if (assignees.length > 1) {
      setAssignees(assignees.filter(a => a !== assignee));
    }
  };

  const handleAddAssignee = (assignee: string) => {
    if (!assignees.includes(assignee)) {
      setAssignees([...assignees, assignee]);
    }
    setShowAssignModal(false);
  };

  const wordCount = (quiz?.description || "").split(/\s+/).filter(Boolean).length;

  return (
    <>
      <Form>
        {/* Title Input */}
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            placeholder="Unnamed Quiz"
            className="border-secondary"
          />
        </Form.Group>

        {/* Quiz Instructions */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-normal">Quiz Instructions:</Form.Label>
          
          {/* Menu bar */}
          <div className="border border-bottom-0 p-2 bg-light d-flex align-items-center gap-3">
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                Edit
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Undo</Dropdown.Item>
                <Dropdown.Item>Redo</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                View
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Fullscreen</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                Insert
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Image</Dropdown.Item>
                <Dropdown.Item>Link</Dropdown.Item>
                <Dropdown.Item>Table</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                Format
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Bold</Dropdown.Item>
                <Dropdown.Item>Italic</Dropdown.Item>
                <Dropdown.Item>Underline</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                Tools
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Spell Check</Dropdown.Item>
                <Dropdown.Item>Word Count</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="link" size="sm" className="text-muted text-decoration-none p-0">
                Table
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Insert Table</Dropdown.Item>
                <Dropdown.Item>Delete Table</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <div className="ms-auto">
              <span className="text-success fw-bold">100%</span>
            </div>
          </div>

          {/* Formatting toolbar */}
          <div className="border border-top-0 border-bottom-0 p-2 bg-white d-flex align-items-center gap-2">
            <Form.Select 
              size="sm" 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{ width: '80px' }}
            >
              <option value="8pt">8pt</option>
              <option value="10pt">10pt</option>
              <option value="12pt">12pt</option>
              <option value="14pt">14pt</option>
              <option value="16pt">16pt</option>
              <option value="18pt">18pt</option>
              <option value="24pt">24pt</option>
              <option value="36pt">36pt</option>
            </Form.Select>
            
            <Form.Select 
              size="sm"
              value={textFormat}
              onChange={(e) => setTextFormat(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="Paragraph">Paragraph</option>
              <option value="Heading 1">Heading 1</option>
              <option value="Heading 2">Heading 2</option>
              <option value="Heading 3">Heading 3</option>
              <option value="Heading 4">Heading 4</option>
              <option value="Preformatted">Preformatted</option>
            </Form.Select>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Bold">
              <BsTypeBold className="fs-6" />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Italic">
              <BsTypeItalic className="fs-6" />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Underline">
              <BsTypeUnderline className="fs-6" />
            </Button>
            
            <div className="vr"></div>
            
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" className="border-0">
                A
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Text Color</Dropdown.Item>
                <Dropdown.Item>Background Color</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Button variant="light" size="sm" className="border-0 p-1 px-2">
              ✏️
            </Button>
            
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" className="border-0">
                T²
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Superscript</Dropdown.Item>
                <Dropdown.Item>Subscript</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <div className="vr"></div>
            
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" className="border-0">
                ⋮
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>More Options</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Text area */}
          <Form.Control
            as="textarea"
            rows={6}
            value={quiz.description || ""}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="border-top-0 rounded-0"
            placeholder="Enter quiz instructions..."
            style={{ fontSize: fontSize, fontFamily: 'Arial, sans-serif' }}
          />
          
          {/* Bottom toolbar */}
          <div className="border border-top-0 p-2 bg-white d-flex justify-content-end align-items-center rounded-bottom gap-3">
            <span className="text-danger small">{wordCount} words</span>
            <span className="text-muted small">&lt;/&gt;</span>
            <Button variant="link" size="sm" className="text-danger p-0 text-decoration-none">
              ✏️
            </Button>
            <BsThreeDotsVertical className="text-muted" style={{ cursor: 'pointer' }} />
          </div>
        </Form.Group>

        {/* Quiz Type */}
        <Form.Group className="mb-3 row">
          <div className="col-sm-2"></div>
          <Form.Label className="col-sm-2 col-form-label text-end">Quiz Type</Form.Label>
          <div className="col-sm-8">
            <Form.Select
              value={quiz.quizType}
              onChange={(e) => setQuiz({ ...quiz, quizType: e.target.value })}
            >
              <option value="GRADED_QUIZ">Graded Quiz</option>
              <option value="PRACTICE_QUIZ">Practice Quiz</option>
              <option value="GRADED_SURVEY">Graded Survey</option>
              <option value="UNGRADED_SURVEY">Ungraded Survey</option>
            </Form.Select>
          </div>
        </Form.Group>

        {/* Assignment Group */}
        <Form.Group className="mb-3 row">
          <div className="col-sm-2"></div>
          <Form.Label className="col-sm-2 col-form-label text-end">Assignment Group</Form.Label>
          <div className="col-sm-8">
            <Form.Select
              value={quiz.assignmentGroup}
              onChange={(e) => setQuiz({ ...quiz, assignmentGroup: e.target.value })}
            >
              <option value="QUIZZES">Quizzes</option>
              <option value="EXAMS">Exams</option>
              <option value="ASSIGNMENTS">ASSIGNMENTS</option>
              <option value="PROJECT">Project</option>
            </Form.Select>
          </div>
        </Form.Group>

        {/* Options Section */}
        <div className="row mb-4">
          <div className="col-sm-2"></div>
          <div className="col-sm-2"></div>
          <div className="col-sm-8">
            <h6 className="mb-3">Options</h6>
            
            <Form.Check
              type="checkbox"
              label="Shuffle Answers"
              checked={quiz.shuffleAnswers}
              onChange={(e) => setQuiz({ ...quiz, shuffleAnswers: e.target.checked })}
              className="mb-3"
            />

            <div className="mb-3">
              <Form.Check
                type="checkbox"
                label="Time Limit"
                checked={!!quiz.timeLimit}
                onChange={(e) => setQuiz({ ...quiz, timeLimit: e.target.checked ? 20 : 0 })}
                inline
              />
              {quiz.timeLimit > 0 && (
                <span className="ms-3">
                  <Form.Control
                    type="number"
                    value={quiz.timeLimit}
                    onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 0 })}
                    className="d-inline-block"
                    style={{ width: '80px' }}
                  />
                  <span className="ms-2">Minutes</span>
                </span>
              )}
            </div>

            <Form.Check
              type="checkbox"
              label="Allow Multiple Attempts"
              checked={quiz.multipleAttempts}
              onChange={(e) => setQuiz({ ...quiz, multipleAttempts: e.target.checked })}
              className="mb-3"
            />

            {quiz.multipleAttempts && (
              <Form.Group className="mb-3 ms-4">
                <Form.Label>How Many Attempts</Form.Label>
                <Form.Control
                  type="number"
                  value={quiz.howManyAttempts || 1}
                  onChange={(e) => setQuiz({ ...quiz, howManyAttempts: parseInt(e.target.value) || 1 })}
                  style={{ width: '100px' }}
                />
              </Form.Group>
            )}
          </div>
        </div>

        {/* Assign Section */}
        <div className="row mb-4">
          <div className="col-sm-2"></div>
          <Form.Label className="col-sm-2 col-form-label text-end align-self-start">Assign</Form.Label>
          <div className="col-sm-8">
            <div className="border rounded p-4 bg-white">
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Assign to</Form.Label>
                <div className="border rounded p-3 bg-white" style={{ minHeight: '60px' }}>
                  {assignees.map((assignee, index) => (
                    <Badge 
                      key={index}
                      bg="light" 
                      text="dark" 
                      className="px-3 py-2 border me-2 mb-2"
                      style={{ fontSize: '0.95rem' }}
                    >
                      {assignee}
                      {assignees.length > 1 && (
                        <button 
                          className="btn-close btn-close-sm ms-3" 
                          aria-label="Remove"
                          style={{ fontSize: '0.6rem' }}
                          onClick={() => handleRemoveAssignee(assignee)}
                        ></button>
                      )}
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Due</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="datetime-local"
                    value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                  />
                  <span className="input-group-text bg-white border-start-0">
                    <BsCalendar3 />
                  </span>
                </div>
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Available from</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="datetime-local"
                        value={quiz.availableDate ? new Date(quiz.availableDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setQuiz({ ...quiz, availableDate: e.target.value })}
                      />
                      <span className="input-group-text bg-white border-start-0">
                        <BsCalendar3 />
                      </span>
                    </div>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Until</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="datetime-local"
                        value={quiz.untilDate ? new Date(quiz.untilDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setQuiz({ ...quiz, untilDate: e.target.value })}
                      />
                      <span className="input-group-text bg-white border-start-0">
                        <BsCalendar3 />
                      </span>
                    </div>
                  </Form.Group>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center border-top pt-3" style={{ borderStyle: 'dashed' }}>
              <Button 
                variant="link" 
                className="text-muted text-decoration-none"
                onClick={() => setShowAssignModal(true)}
              >
                + Add
              </Button>
            </div>
          </div>
        </div>

        <hr className="my-4" />
        
        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-end pb-4">
          <Button 
            variant="light" 
            onClick={handleCancel}
            className="border px-4"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSave}
            className="px-4"
          >
            Save
          </Button>
          <Button 
            variant="danger" 
            onClick={handleSaveAndPublish}
            className="px-4"
          >
            Save & Publish
          </Button>
        </div>
      </Form>

      {/* Add Assignee Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Assignees</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="list-group list-group-flush">
            <button 
              className="list-group-item list-group-item-action"
              onClick={() => handleAddAssignee("Everyone")}
            >
              Everyone
            </button>
            <button 
              className="list-group-item list-group-item-action"
              onClick={() => handleAddAssignee("Students")}
            >
              Students
            </button>
            <button 
              className="list-group-item list-group-item-action"
              onClick={() => handleAddAssignee("TAs")}
            >
              TAs
            </button>
            <button 
              className="list-group-item list-group-item-action"
              onClick={() => handleAddAssignee("Faculty")}
            >
              Faculty
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}