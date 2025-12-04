"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { Button } from "react-bootstrap";
import * as client from "../client";

export default function QuizDetails() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await client.findQuizById(qid);
        setQuiz(quizData);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };
    fetchQuiz();
  }, [qid]);

  if (!quiz) return <div>Loading...</div>;

  const handleStartQuiz = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/take`); // FIXED
  };

  const handlePreview = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/preview`); // FIXED
  };

  const handleEdit = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/edit`); // FIXED
  };

  return (
    <div id="wd-quiz-details" className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title}</h2>
        <div className="d-flex gap-2">
          {isFaculty && (
            <>
              <Button variant="light" onClick={handlePreview}>
                Preview
              </Button>
              <Button variant="danger" onClick={handleEdit}>
                Edit
              </Button>
            </>
          )}
          {!isFaculty && (
            <Button variant="danger" onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr>
                <td className="fw-bold">Quiz Type</td>
                <td>{quiz.quizType}</td>
              </tr>
              <tr>
                <td className="fw-bold">Points</td>
                <td>{quiz.points}</td>
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
        </div>
      </div>
    </div>
  );
}