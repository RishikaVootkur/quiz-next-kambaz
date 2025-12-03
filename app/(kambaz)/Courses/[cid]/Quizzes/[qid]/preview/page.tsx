"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import * as client from "../../client";

export default function QuizPreview() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    
    quiz.questions.forEach((question: any) => {
      const userAnswer = answers[question._id];
      let isCorrect = false;

      if (question.type === "MULTIPLE_CHOICE") {
        const correctChoice = question.choices.find((c: any) => c.isCorrect);
        isCorrect = userAnswer === correctChoice?.text;
      } else if (question.type === "TRUE_FALSE") {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === "FILL_BLANK") {
        const answerText = question.caseSensitive 
          ? userAnswer 
          : userAnswer?.toLowerCase();
        isCorrect = question.possibleAnswers.some((possible: string) => {
          const possibleText = question.caseSensitive 
            ? possible 
            : possible.toLowerCase();
          return answerText === possibleText;
        });
      }

      if (isCorrect) {
        calculatedScore += question.points;
      }
    });

    setScore(calculatedScore);
    setShowResults(true);
  };

  const isCorrect = (question: any) => {
    const userAnswer = answers[question._id];
    
    if (question.type === "MULTIPLE_CHOICE") {
      const correctChoice = question.choices.find((c: any) => c.isCorrect);
      return userAnswer === correctChoice?.text;
    } else if (question.type === "TRUE_FALSE") {
      return userAnswer === question.correctAnswer;
    } else if (question.type === "FILL_BLANK") {
      const answerText = question.caseSensitive 
        ? userAnswer 
        : userAnswer?.toLowerCase();
      return question.possibleAnswers.some((possible: string) => {
        const possibleText = question.caseSensitive 
          ? possible 
          : possible.toLowerCase();
        return answerText === possibleText;
      });
    }
    return false;
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div id="wd-quiz-preview" className="p-4">
      <div className="alert alert-warning">
        This is a preview of the published version of the quiz
      </div>

      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>

      {!showResults ? (
        <>
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
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSubmit}>
              Submit Quiz
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="alert alert-success">
            <h4>Quiz Submitted!</h4>
            <p>Score: {score} / {quiz.points}</p>
          </div>

          {quiz.questions?.map((question: any, index: number) => (
            <div key={question._id} className={`card mb-3 ${isCorrect(question) ? 'border-success' : 'border-danger'}`}>
              <div className="card-body">
                <h5>
                  Question {index + 1} ({question.points} pts)
                  {isCorrect(question) ? " ✓" : " ✗"}
                </h5>
                <p>{question.question}</p>
                <p><strong>Your answer:</strong> {String(answers[question._id])}</p>
              </div>
            </div>
          ))}

          <Button variant="primary" onClick={() => router.back()}>
            Back to Quiz
          </Button>
        </>
      )}
    </div>
  );
}