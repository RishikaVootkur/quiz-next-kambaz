"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import * as client from "../client";

export default function QuizDetails() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [enteredAccessCode, setEnteredAccessCode] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");
  const [latestAttempt, setLatestAttempt] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const isAdmin = currentUser?.role === "ADMIN";
  const isStudent = !isFaculty && !isAdmin;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await client.findQuizById(qid);
        setQuiz(quizData);

        // Fetch student's latest attempt
        if (isStudent) {
          try {
            const latest = await client.getLatestAttempt(qid);
            setLatestAttempt(latest);
            
            const attempts = await client.getAttemptsForQuiz(qid);
            setAttemptCount(attempts.length);
          } catch (error) {
            console.error("No attempts found");
            setLatestAttempt(null);
            setAttemptCount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };
    fetchQuiz();
  }, [qid, isStudent]);

  if (!quiz) return <div>Loading...</div>;

  const canTakeQuiz = () => {
    // No attempt yet - can take
    if (!latestAttempt || !latestAttempt.submittedAt) return true;
    
    // Single attempt only - can't retake
    if (!quiz.multipleAttempts) return false;
    
    // Multiple attempts - check if any remaining
    return attemptCount < quiz.howManyAttempts;
  };

  const handleStartQuiz = () => {
    // Check if can take quiz
    if (!canTakeQuiz()) {
      alert("You have used all your attempts for this quiz.");
      return;
    }

    // Check access code
    if (quiz.accessCode && quiz.accessCode.trim() !== "") {
      setShowAccessCodeModal(true);
    } else {
      router.push(`/Courses/${cid}/Quizzes/${qid}/take`);
    }
  };

  const handleViewResults = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/results`);
  };

  const handleAccessCodeSubmit = () => {
    if (enteredAccessCode === quiz.accessCode) {
      setShowAccessCodeModal(false);
      setAccessCodeError("");
      setEnteredAccessCode("");
      router.push(`/Courses/${cid}/Quizzes/${qid}/take`);
    } else {
      setAccessCodeError("Incorrect access code. Please try again or contact your professor.");
    }
  };

  const handlePreview = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/preview`);
  };

  const handleEdit = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/edit`);
  };

  const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;

  return (
    <div id="wd-quiz-details" className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title}</h2>
        <div className="d-flex gap-2">
          {/* Faculty/Admin Buttons */}
          {(isFaculty || isAdmin) && (
            <>
              <Button variant="light" onClick={handlePreview}>
                Preview
              </Button>
              <Button variant="danger" onClick={handleEdit}>
                Edit
              </Button>
            </>
          )}
          
          {/* Student Buttons */}
          {isStudent && (
            <>
              {latestAttempt && latestAttempt.submittedAt && (
                <Button variant="primary" onClick={handleViewResults}>
                  View Results
                </Button>
              )}
              
              {canTakeQuiz() && (
                <Button variant="danger" onClick={handleStartQuiz}>
                  {latestAttempt && latestAttempt.submittedAt 
                    ? `Retake Quiz (${attemptCount}/${quiz.howManyAttempts})` 
                    : "Start Quiz"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

              {/* Student's Last Attempt Score */}
        {isStudent && latestAttempt && latestAttempt.submittedAt && (
          (() => {
            // Calculate correct total points from quiz questions
            const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;
            const maxScore = totalPoints > 0 ? totalPoints : latestAttempt.maxScore;
            const percentage = maxScore > 0 ? ((latestAttempt.score / maxScore) * 100).toFixed(2) : "0.00";
            
            return (
              <Alert variant="info" className="mb-4">
                <strong>Your Last Attempt:</strong> {latestAttempt.score} / {maxScore} points ({percentage}%)
                <br />
                <small>Submitted: {new Date(latestAttempt.submittedAt).toLocaleString()}</small>
                {canTakeQuiz() && quiz.multipleAttempts && (
                  <div className="mt-2">
                    <small>You have {quiz.howManyAttempts - attemptCount} attempt(s) remaining.</small>
                  </div>
                )}
              </Alert>
            );
          })()
        )}

      <div className="card">
        <div className="card-body">
          {/* Student View */}
          {isStudent && (
            <>
              <h5 className="mb-3">Quiz Information</h5>
              <table className="table">
                <tbody>
                  <tr>
                    <td className="fw-bold">Quiz Type</td>
                    <td>{quiz.quizType}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Points</td>
                    <td>{totalPoints}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Number of Questions</td>
                    <td>{quiz.questions?.length || 0}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Time Limit</td>
                    <td>{quiz.timeLimit} Minutes</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Multiple Attempts</td>
                    <td>{quiz.multipleAttempts ? `Yes (${quiz.howManyAttempts} attempts)` : "No"}</td>
                  </tr>
                  {quiz.accessCode && quiz.accessCode.trim() !== "" && (
                    <tr>
                      <td className="fw-bold">Access Code</td>
                      <td className="text-muted">
                        🔒 This quiz requires an access code
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <table className="table mt-4">
                <thead>
                  <tr>
                    <th>Due</th>
                    <th>Available from</th>
                    <th>Until</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{quiz.dueDate ? new Date(quiz.dueDate).toLocaleString() : "N/A"}</td>
                    <td>{quiz.availableDate ? new Date(quiz.availableDate).toLocaleString() : "N/A"}</td>
                    <td>{quiz.untilDate ? new Date(quiz.untilDate).toLocaleString() : "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Faculty/Admin View */}
          {(isFaculty || isAdmin) && (
            <>
              <table className="table">
                <tbody>
                  <tr>
                    <td className="fw-bold">Quiz Type</td>
                    <td>{quiz.quizType}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Points</td>
                    <td>{totalPoints}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Assignment Group</td>
                    <td>{quiz.assignmentGroup}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Shuffle Answers</td>
                    <td>{quiz.shuffleAnswers ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Time Limit</td>
                    <td>{quiz.timeLimit} Minutes</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Multiple Attempts</td>
                    <td>{quiz.multipleAttempts ? `Yes (${quiz.howManyAttempts} attempts)` : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">View Responses</td>
                    <td>{quiz.viewResponses || "Always"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Show Correct Answers</td>
                    <td>{quiz.showCorrectAnswers}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Access Code</td>
                    <td>{quiz.accessCode || "None"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">One Question at a Time</td>
                    <td>{quiz.oneQuestionAtATime ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Require Respondus LockDown Browser</td>
                    <td>{quiz.requireRespondusLockDown ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Required to View Quiz Results</td>
                    <td>{quiz.requiredToViewQuizResults ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Webcam Required</td>
                    <td>{quiz.webcamRequired ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Lock Questions After Answering</td>
                    <td>{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</td>
                  </tr>
                </tbody>
              </table>

              <table className="table mt-4">
                <thead>
                  <tr>
                    <th>Due</th>
                    <th>For</th>
                    <th>Available from</th>
                    <th>Until</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{quiz.dueDate ? new Date(quiz.dueDate).toLocaleString() : "N/A"}</td>
                    <td>Everyone</td>
                    <td>{quiz.availableDate ? new Date(quiz.availableDate).toLocaleString() : "N/A"}</td>
                    <td>{quiz.untilDate ? new Date(quiz.untilDate).toLocaleString() : "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Access Code Modal */}
      <Modal show={showAccessCodeModal} onHide={() => setShowAccessCodeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Access Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            This quiz requires an access code to start. Please enter the code provided by your professor.
          </p>
          {accessCodeError && (
            <Alert variant="danger">{accessCodeError}</Alert>
          )}
          <Form.Group>
            <Form.Label>Access Code</Form.Label>
            <Form.Control
              type="text"
              value={enteredAccessCode}
              onChange={(e) => setEnteredAccessCode(e.target.value)}
              placeholder="Enter access code"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAccessCodeSubmit();
                }
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAccessCodeModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAccessCodeSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}