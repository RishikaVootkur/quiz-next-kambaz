"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import * as client from "../../client";

export default function TakeQuiz() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const quizData = await client.findQuizById(qid);
        setQuiz(quizData);

        const attempts = await client.getAttemptsForQuiz(qid);
        const attemptCount = attempts.length;

        if (!quizData.multipleAttempts && attemptCount >= 1) {
          setError("You have already completed this quiz.");
          return;
        }

        if (quizData.multipleAttempts && attemptCount >= quizData.howManyAttempts) {
          setError("You have used all your attempts for this quiz.");
          return;
        }

        const newAttempt = await client.startAttempt(qid);
        setAttempt(newAttempt);
      } catch (error: any) {
        console.error("Error initializing quiz:", error);
        setError(error.response?.data?.message || "Failed to start quiz");
      }
    };
    initQuiz();
  }, [qid]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to submit this quiz?")) {
      try {
        const answersArray = Object.keys(answers).map(questionId => ({
          questionId,
          answer: answers[questionId]
        }));

        const submittedAttempt = await client.submitAttempt(attempt._id, answersArray);
        setAttempt(submittedAttempt);
        setSubmitted(true);
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    }
  };

  const isCorrect = (questionId: string) => {
    const answer = attempt?.answers?.find((a: any) => a.questionId === questionId);
    return answer?.isCorrect;
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
          Back to Quizzes
        </Button>
      </div>
    );
  }

  if (!quiz || !attempt) return <div>Loading...</div>;

  return (
    <div id="wd-take-quiz" className="p-4">
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>

      {!submitted ? (
        <>
          <Alert variant="info">
            This quiz has {quiz.questions?.length || 0} questions worth {quiz.points} points.
            {quiz.timeLimit && ` Time limit: ${quiz.timeLimit} minutes.`}
          </Alert>

          {quiz.questions?.map((question: any, index: number) => (
            <div key={question._id} className="card mb-3">
              <div className="card-body">
                <h5>Question {index + 1} ({question.points} pts)</h5>
                <p>{question.question}</p>

                {question.type === "MULTIPLE_CHOICE" && (
                  <div>
                    {question.choices.map((choice: any, choiceIndex: number) => (
                      <Form.Check
                        key={choiceIndex}
                        type="radio"
                        name={`question-${question._id}`}
                        label={choice.text}
                        checked={answers[question._id] === choice.text}
                        onChange={() => handleAnswerChange(question._id, choice.text)}
                      />
                    ))}
                  </div>
                )}

                {question.type === "TRUE_FALSE" && (
                  <div>
                    <Form.Check
                      type="radio"
                      name={`question-${question._id}`}
                      label="True"
                      checked={answers[question._id] === true}
                      onChange={() => handleAnswerChange(question._id, true)}
                    />
                    <Form.Check
                      type="radio"
                      name={`question-${question._id}`}
                      label="False"
                      checked={answers[question._id] === false}
                      onChange={() => handleAnswerChange(question._id, false)}
                    />
                  </div>
                )}

                {question.type === "FILL_BLANK" && (
                  <Form.Control
                    type="text"
                    value={answers[question._id] || ""}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    placeholder="Your answer"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSubmit}>
              Submit Quiz
            </Button>
          </div>
        </>
      ) : (
        <>
          <Alert variant="success">
            <h4>Quiz Submitted!</h4>
            <p>Score: {attempt.score} / {attempt.maxScore}</p>
            <p>Percentage: {((attempt.score / attempt.maxScore) * 100).toFixed(2)}%</p>
          </Alert>

          {quiz.showCorrectAnswers !== "NEVER" && (
            <>
              <h4 className="mt-4">Results:</h4>
              {quiz.questions?.map((question: any, index: number) => (
                <div 
                  key={question._id} 
                  className={`card mb-3 ${isCorrect(question._id) ? 'border-success' : 'border-danger'}`}
                >
                  <div className="card-body">
                    <h5>
                      Question {index + 1} ({question.points} pts)
                      {isCorrect(question._id) ? " ✓" : " ✗"}
                    </h5>
                    <p>{question.question}</p>
                    <p>
                      <strong>Your answer:</strong> {String(answers[question._id])}
                    </p>
                    {!isCorrect(question._id) && (
                      <p className="text-danger">
                        <strong>Status:</strong> Incorrect
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          <Button variant="primary" onClick={() => router.push(`/Courses/${cid}/Quizzes`)}>
            Back to Quizzes
          </Button>
        </>
      )}
    </div>
  );
}