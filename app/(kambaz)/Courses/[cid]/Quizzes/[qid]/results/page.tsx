"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Alert } from "react-bootstrap";
import * as client from "../../client";

export default function QuizResults() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = await client.findQuizById(qid);
        setQuiz(quizData);

        const latestAttempt = await client.getLatestAttempt(qid);
        setAttempt(latestAttempt);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
    fetchData();
  }, [qid]);

  const isCorrect = (questionId: string) => {
    const answer = attempt?.answers?.find((a: any) => a.questionId === questionId);
    return answer?.isCorrect;
  };

  const getUserAnswer = (questionId: string) => {
    const answer = attempt?.answers?.find((a: any) => a.questionId === questionId);
    return answer?.answer;
  };

  if (!quiz || !attempt) return <div className="p-4">Loading...</div>;

  if (!attempt.submittedAt) {
    return (
      <div className="p-4">
        <Alert variant="warning">You have not completed this quiz yet.</Alert>
        <Button onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
          Back to Quiz
        </Button>
      </div>
    );
  }

  // Calculate correct total points from quiz questions
  const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;
  const maxScore = totalPoints > 0 ? totalPoints : attempt.maxScore;
  const percentage = maxScore > 0 ? ((attempt.score / maxScore) * 100).toFixed(2) : "0.00";

  // Determine if we should show detailed answers
  const showDetailedAnswers = 
    !quiz.multipleAttempts || // Single attempt - always show
    attempt.attemptNumber >= quiz.howManyAttempts || // Last attempt - show
    quiz.showCorrectAnswers !== "NEVER"; // Faculty setting

  return (
    <div id="wd-quiz-results" className="p-4">
      <h2>{quiz.title} - Results</h2>
      
      <Alert variant="success" className="mt-4">
        <h4>Your Score: {attempt.score} / {maxScore}</h4>
        <p>Percentage: {percentage}%</p>
        <p className="mb-0">
          <small>
            Submitted: {new Date(attempt.submittedAt).toLocaleString()}
            <br />
            Attempt {attempt.attemptNumber} of {quiz.howManyAttempts || 1}
          </small>
        </p>
      </Alert>

      {/* Show detailed answers only if appropriate */}
      {showDetailedAnswers ? (
        <>
          <h4 className="mt-4 mb-3">Your Answers:</h4>
          {quiz.questions?.map((question: any, index: number) => {
            const userAnswer = getUserAnswer(question._id);
            const correct = isCorrect(question._id);
            
            return (
              <div 
                key={question._id} 
                className={`card mb-3 ${correct ? 'border-success' : 'border-danger'}`}
              >
                <div className="card-body">
                  <h5>
                    Question {index + 1} ({question.points} pts)
                    {correct ? " ✓" : " ✗"}
                  </h5>
                  <div dangerouslySetInnerHTML={{ __html: question.question }} className="mb-3" />
                  
                  <p className="mb-2">
                    <strong>Your answer:</strong> {String(userAnswer)}
                  </p>
                  
                  {!correct && (
                    <div className="text-danger">
                      <strong>Status:</strong> Incorrect
                    </div>
                  )}
                  
                  {correct && (
                    <div className="text-success">
                      <strong>Status:</strong> Correct - {question.points} points earned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <Alert variant="info" className="mt-4">
          <h5>Answers Hidden</h5>
          <p className="mb-0">
            You have {quiz.howManyAttempts - attempt.attemptNumber} attempt(s) remaining. 
            Detailed answers will be shown after you complete all attempts.
          </p>
        </Alert>
      )}

      <div className="mt-4">
        <Button variant="primary" onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
          Back to Quiz Details
        </Button>
        {quiz.multipleAttempts && attempt.attemptNumber < quiz.howManyAttempts && (
          <Button 
            variant="danger" 
            className="ms-2"
            onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/take`)}
          >
            Take Quiz Again
          </Button>
        )}
      </div>
    </div>
  );
}