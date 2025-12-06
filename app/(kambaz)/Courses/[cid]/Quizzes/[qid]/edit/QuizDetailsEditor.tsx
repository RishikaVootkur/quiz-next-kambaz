"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button, Form, Badge, Modal } from "react-bootstrap";
import { BsTypeBold, BsTypeItalic, BsTypeUnderline } from "react-icons/bs";
import * as client from "../../client";

export default function QuizDetailsEditor({ 
  quiz, 
  setQuiz,
  onUnsavedChanges 
}: { 
  quiz: any; 
  setQuiz: (quiz: any) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}) {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignees, setAssignees] = useState<string[]>(["Everyone"]);
  const [initialQuiz, setInitialQuiz] = useState<any>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const applyDescriptionFormat = (formatType: 'bold' | 'italic' | 'underline') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = (quiz.description || '').substring(start, end);
    
    if (!selectedText) {
      alert('Please select text first');
      return;
    }

    let formattedText = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
    }

    const newText = 
      (quiz.description || '').substring(0, start) + 
      formattedText + 
      (quiz.description || '').substring(end);
    
    setQuiz({ ...quiz, description: newText });

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 10);
  };

  useEffect(() => {
    if (quiz?.assignTo && quiz.assignTo.length > 0) {
      setAssignees(quiz.assignTo);
    }
    if (!initialQuiz) {
      setInitialQuiz(JSON.parse(JSON.stringify(quiz)));
    }
  }, [quiz, initialQuiz]);

  useEffect(() => {
    if (initialQuiz && onUnsavedChanges) {
      const hasChanges = JSON.stringify(quiz) !== JSON.stringify(initialQuiz);
      onUnsavedChanges(hasChanges);
    }
  }, [quiz, initialQuiz, onUnsavedChanges]);

  const handleSave = async () => {
    try {
      const updatedQuiz = { ...quiz, assignTo: assignees };
      await client.updateQuiz(updatedQuiz);
      setInitialQuiz(JSON.parse(JSON.stringify(updatedQuiz)));
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
      setInitialQuiz(JSON.parse(JSON.stringify(updatedQuiz)));
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
          
          {/* Formatting Toolbar */}
          <div className="border border-bottom-0 rounded-top p-2 bg-light d-flex align-items-center gap-2">
            <Button 
              variant="light" 
              size="sm" 
              className="border px-3" 
              title="Bold (select text first)"
              onClick={() => applyDescriptionFormat('bold')}
            >
              <BsTypeBold /> <strong>Bold</strong>
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              className="border px-3" 
              title="Italic (select text first)"
              onClick={() => applyDescriptionFormat('italic')}
            >
              <BsTypeItalic /> <em>Italic</em>
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              className="border px-3" 
              title="Underline (select text first)"
              onClick={() => applyDescriptionFormat('underline')}
            >
              <BsTypeUnderline /> <u>Underline</u>
            </Button>
            <small className="text-muted ms-3">💡 Select text, then click a button to format</small>
          </div>

          {/* Text area */}
          <Form.Control
            ref={descriptionRef}
            as="textarea"
            rows={6}
            value={quiz.description || ""}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="border-top-0 rounded-0"
            placeholder="Enter quiz instructions..."
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
          />
          
          {/* Preview & Word Count */}
          <div className="border border-top-0 rounded-bottom p-2 bg-light d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <small className="text-muted d-block mb-1">Preview:</small>
              <div dangerouslySetInnerHTML={{ __html: quiz.description || '<em>No instructions yet</em>' }} />
            </div>
            <span className="text-muted small">{wordCount} words</span>
          </div>
        </Form.Group>

        {/* Points Section - NEW */}
        <Form.Group className="mb-3 row">
          <div className="col-sm-2"></div>
          <Form.Label className="col-sm-2 col-form-label text-end">Points</Form.Label>
          <div className="col-sm-8">
            <Form.Control
              type="number"
              value={quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0}
              disabled
              readOnly
              className="bg-light"
            />
            <Form.Text className="text-muted">
              Total points are calculated from all questions
            </Form.Text>
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

            <div className="mb-3">
              <Form.Check
                type="checkbox"
                label="Allow Multiple Attempts"
                checked={quiz.multipleAttempts}
                onChange={(e) => setQuiz({ ...quiz, multipleAttempts: e.target.checked })}
              />
            </div>

            {quiz.multipleAttempts && (
              <Form.Group className="mb-3 ms-4">
                <Form.Label>How Many Attempts</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    value={quiz.howManyAttempts || 1}
                    onChange={(e) => setQuiz({ ...quiz, howManyAttempts: parseInt(e.target.value) || 1 })}
                    style={{ width: '100px' }}
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    (Enter a number or leave blank for unlimited)
                  </Form.Text>
                </div>
              </Form.Group>
            )}

            {/* Show Correct Answers */}
            <Form.Group className="mb-3">
              <Form.Label>Show Correct Answers</Form.Label>
              <Form.Select
                value={quiz.showCorrectAnswers || "IMMEDIATELY"}
                onChange={(e) => setQuiz({ ...quiz, showCorrectAnswers: e.target.value })}
                style={{ maxWidth: '300px' }}
              >
                <option value="IMMEDIATELY">Immediately</option>
                <option value="AFTER_DUE_DATE">After Due Date</option>
                <option value="AFTER_LAST_ATTEMPT">After Last Attempt</option>
                <option value="NEVER">Never</option>
              </Form.Select>
            </Form.Group>

            {/* Access Code */}
            <Form.Group className="mb-3">
              <Form.Label>Access Code</Form.Label>
              <Form.Control
                type="text"
                value={quiz.accessCode || ""}
                onChange={(e) => setQuiz({ ...quiz, accessCode: e.target.value })}
                placeholder="Optional access code"
                style={{ maxWidth: '300px' }}
              />
              <Form.Text className="text-muted">
                Students must enter this code to access the quiz
              </Form.Text>
            </Form.Group>

            {/* One Question at a Time */}
            <Form.Check
              type="checkbox"
              label="One Question at a Time"
              checked={quiz.oneQuestionAtATime}
              onChange={(e) => setQuiz({ ...quiz, oneQuestionAtATime: e.target.checked })}
              className="mb-3"
            />

            {/* Webcam Required */}
            <Form.Check
              type="checkbox"
              label="Webcam Required"
              checked={quiz.webcamRequired}
              onChange={(e) => setQuiz({ ...quiz, webcamRequired: e.target.checked })}
              className="mb-3"
            />

            {/* Lock Questions After Answering */}
            <Form.Check
              type="checkbox"
              label="Lock Questions After Answering"
              checked={quiz.lockQuestionsAfterAnswering}
              onChange={(e) => setQuiz({ ...quiz, lockQuestionsAfterAnswering: e.target.checked })}
              className="mb-3"
            />

            {/* View Responses */}
            <Form.Group className="mb-3">
              <Form.Label>View Responses</Form.Label>
              <Form.Select
                value={quiz.viewResponses || "ALWAYS"}
                onChange={(e) => setQuiz({ ...quiz, viewResponses: e.target.value })}
                style={{ maxWidth: '300px' }}
              >
                <option value="ALWAYS">Always</option>
                <option value="NEVER">Never</option>
              </Form.Select>
            </Form.Group>

            {/* Require Respondus LockDown Browser */}
            <Form.Check
              type="checkbox"
              label="Require Respondus LockDown Browser"
              checked={quiz.requireRespondusLockDown || false}
              onChange={(e) => setQuiz({ ...quiz, requireRespondusLockDown: e.target.checked })}
              className="mb-3"
            />

            {/* Required to View Quiz Results */}
            <Form.Check
              type="checkbox"
              label="Required to View Quiz Results"
              checked={quiz.requiredToViewQuizResults || false}
              onChange={(e) => setQuiz({ ...quiz, requiredToViewQuizResults: e.target.checked })}
              className="mb-3"
            />
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
                <Form.Control
                  type="datetime-local"
                  value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Available from</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={quiz.availableDate ? new Date(quiz.availableDate).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setQuiz({ ...quiz, availableDate: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Until</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={quiz.untilDate ? new Date(quiz.untilDate).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setQuiz({ ...quiz, untilDate: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center border-top py-3 bg-light" style={{ borderStyle: 'dashed', borderColor: '#dee2e6' }}>
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