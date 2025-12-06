"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { Button, Alert } from "react-bootstrap";
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [startTime] = useState(new Date());
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const isAdmin = currentUser?.role === "ADMIN";

  // Auto-redirect countdown after submission
  useEffect(() => {
    if (submitted && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (submitted && redirectCountdown === 0) {
      router.push(`/Courses/${cid}/Quizzes`);
    }
  }, [submitted, redirectCountdown, router, cid]);

  // Timer initialization
  useEffect(() => {
    if (quiz && quiz.timeLimit && timeRemaining === null && attempt && !submitted) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  }, [quiz, attempt, submitted, timeRemaining]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining, submitted]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeRemaining === 0 && !submitted && !timerExpired && attempt) {
      setTimerExpired(true);
      
      const autoSubmit = async () => {
        if (isFaculty || isAdmin) return;
        
        try {
          const answersArray = Object.keys(answers).map(questionId => ({
            questionId,
            answer: answers[questionId]
          }));

          const submittedAttempt = await client.submitAttempt(attempt._id, answersArray);
          setAttempt(submittedAttempt);
          setSubmitted(true);
        } catch (error) {
          console.error("Error auto-submitting quiz:", error);
        }
      };
      
      autoSubmit();
    }
  }, [timeRemaining, submitted, timerExpired, attempt, answers, isFaculty, isAdmin]);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const quizData = await client.findQuizById(qid);
        setQuiz(quizData);

        if (isFaculty || isAdmin) {
          setAttempt({
            _id: 'preview-attempt',
            quizId: qid,
            userId: currentUser._id,
            score: 0,
            maxScore: 0,
            attemptNumber: 1
          });
          return;
        }

        const attempts = await client.getAttemptsForQuiz(qid);
        const attemptCount = attempts.length;

        // Check for in-progress attempt FIRST
        const inProgressAttempt = attempts.find((a: any) => !a.submittedAt);
        
        if (inProgressAttempt) {
          setAttempt(inProgressAttempt);
          if (inProgressAttempt.answers && Array.isArray(inProgressAttempt.answers)) {
            const restoredAnswers: any = {};
            inProgressAttempt.answers.forEach((ans: any) => {
              restoredAnswers[ans.questionId] = ans.answer;
            });
            setAnswers(restoredAnswers);
          }
          return;
        }

        // Check if single attempt and already completed
        if (!quizData.multipleAttempts && attemptCount >= 1) {
          setError("You have already completed this quiz.");
          setTimeout(() => {
            router.push(`/Courses/${cid}/Quizzes/${qid}`);
          }, 2000);
          return;
        }

        // Check if all attempts used
        if (quizData.multipleAttempts && attemptCount >= quizData.howManyAttempts) {
          setError("You have used all your attempts for this quiz.");
          setTimeout(() => {
            router.push(`/Courses/${cid}/Quizzes/${qid}`);
          }, 2000);
          return;
        }

        // Start new attempt
        const newAttempt = await client.startAttempt(qid);
        setAttempt(newAttempt);
        
      } catch (error: any) {
        console.error("Error initializing quiz:", error);
        if (isFaculty || isAdmin) {
          setAttempt({
            _id: 'preview-attempt',
            quizId: qid,
            userId: currentUser?._id,
            score: 0,
            maxScore: 0,
            attemptNumber: 1
          });
        } else {
          setError(error.response?.data?.message || "Failed to start quiz");
        }
      }
    };
    initQuiz();
  }, [qid, isFaculty, isAdmin, currentUser, router, cid]);

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent navigation away
  useEffect(() => {
    if (attempt && !submitted && !isFaculty && !isAdmin) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'If you leave this page, your current attempt will be lost. Are you sure?';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [attempt, submitted, isFaculty, isAdmin]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const shouldSubmit = timerExpired || window.confirm("Are you sure you want to submit this quiz?");
    
    if (!shouldSubmit) return;

    try {
      if (isFaculty || isAdmin) {
        let calculatedScore = 0;
        
        quiz.questions.forEach((question: any) => {
          const userAnswer = answers[question._id];
          let correct = false;

          if (question.type === "MULTIPLE_CHOICE") {
            const correctChoice = question.choices.find((c: any) => c.isCorrect);
            correct = userAnswer === correctChoice?.text;
          } else if (question.type === "TRUE_FALSE") {
            correct = userAnswer === question.correctAnswer;
          } else if (question.type === "FILL_BLANK") {
            const answerText = question.caseSensitive 
              ? userAnswer 
              : userAnswer?.toLowerCase();
            correct = question.possibleAnswers.some((possible: string) => {
              const possibleText = question.caseSensitive 
                ? possible 
                : possible.toLowerCase();
              return answerText === possibleText;
            });
          }

          if (correct) {
            calculatedScore += question.points;
          }
        });

        setAttempt({
          ...attempt,
          score: calculatedScore,
          attemptNumber: 1,
          answers: quiz.questions.map((q: any) => ({
            questionId: q._id,
            isCorrect: false
          }))
        });
        setSubmitted(true);
        return;
      }

      const answersArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId]
      }));

      const submittedAttempt = await client.submitAttempt(attempt._id, answersArray);
      setAttempt(submittedAttempt);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz. Please try again.");
    }
  };

  const isCorrectAnswer = (questionId: string) => {
    const question = quiz.questions.find((q: any) => q._id === questionId);
    const userAnswer = answers[questionId];
    
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

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="warning">
          <h5>Cannot Take Quiz</h5>
          <p>{error}</p>
          <small>Redirecting to quiz details...</small>
        </Alert>
        <Button onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
          Go to Quiz Details Now
        </Button>
      </div>
    );
  }

  if (!quiz || !attempt) return <div className="p-4">Loading...</div>;

  if (submitted) {
    const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;
    const safePercentage = totalPoints > 0 ? ((attempt.score / totalPoints) * 100).toFixed(2) : "0.00";
    
    const isLastAttempt = !quiz.multipleAttempts || attempt.attemptNumber >= quiz.howManyAttempts;
    const showDetailedAnswers = isLastAttempt || quiz.showCorrectAnswers === "IMMEDIATELY";
    
    return (
      <div id="wd-take-quiz" className="p-4">
        <Alert variant="success">
          <h4>Quiz Submitted Successfully! ✓</h4>
          <div className="mt-3">
            <h5>Your Score: {attempt.score} / {totalPoints} points</h5>
            <p className="mb-2">Percentage: {safePercentage}%</p>
            <p className="mb-2">
              <small>Attempt {attempt.attemptNumber} of {quiz.howManyAttempts || 1}</small>
            </p>
            <hr />
            <p className="mb-0 text-info">
              <strong>Redirecting to Quizzes page in {redirectCountdown} seconds...</strong>
            </p>
            <small className="text-muted">Your score will be displayed on the Quizzes list.</small>
          </div>
        </Alert>

        {showDetailedAnswers ? (
          <>
            <h4 className="mt-4">Detailed Results:</h4>
            {quiz.questions?.map((question: any, index: number) => (
              <div 
                key={question._id} 
                className={`card mb-3 ${isCorrectAnswer(question._id) ? 'border-success' : 'border-danger'}`}
              >
                <div className="card-body">
                  <h5>
                    Question {index + 1} ({question.points} pts) {isCorrectAnswer(question._id) ? "✓" : "✗"}
                  </h5>
                  <div dangerouslySetInnerHTML={{ __html: question.question }} />
                  <p className="mt-2">
                    <strong>Your answer:</strong> {String(answers[question._id])}
                  </p>
                  {!isCorrectAnswer(question._id) ? (
                    <p className="text-danger">
                      <strong>Status:</strong> Incorrect
                    </p>
                  ) : (
                    <p className="text-success">
                      <strong>Status:</strong> Correct - {question.points} points earned
                    </p>
                  )}
                </div>
              </div>
            ))}
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

        <div className="mt-4 d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => router.push(`/Courses/${cid}/Quizzes`)}
          >
            Go to Quizzes Now
          </Button>
          {quiz.multipleAttempts && attempt.attemptNumber < quiz.howManyAttempts && (
            <Button 
              variant="danger"
              onClick={() => {
                setRedirectCountdown(999);
                router.push(`/Courses/${cid}/Quizzes/${qid}`);
              }}
            >
              Take Quiz Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return <div className="p-4">No questions available</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div id="wd-take-quiz" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ display: 'flex' }}>
        <div 
          style={{ 
            flex: 1, 
            marginRight: showSidebar ? '220px' : '0',
            transition: 'margin-right 0.3s ease'
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                marginBottom: '1rem',
                padding: '1rem'
              }}
            >
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {quiz.title}
              </h1>
              
              <div 
                style={{ 
                  backgroundColor: '#d1ecf1', 
                  border: '1px solid #bee5eb', 
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <span style={{ color: '#0c5460', marginRight: '0.5rem' }}>ⓘ</span>
                  <span style={{ color: '#0c5460' }}>
                    This quiz has {quiz.questions?.length || 0} questions worth {quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0} points.
                  </span>
                </div>
                
                {quiz.timeLimit && timeRemaining !== null && (
                  <div 
                    style={{ 
                      backgroundColor: timeRemaining < 60 ? '#f8d7da' : 'white',
                      color: timeRemaining < 60 ? '#721c24' : '#0c5460',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '0.25rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      border: `2px solid ${timeRemaining < 60 ? '#f5c6cb' : '#bee5eb'}`
                    }}
                  >
                    ⏱️ Time: {formatTimeRemaining(timeRemaining)}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Started: {formatDateTime(startTime)}
              </div>
            </div>

            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', color: '#6b7280' }}>▷</span>
                    <h3 style={{ fontWeight: '600', margin: 0, fontSize: '1.1rem' }}>
                      Question {currentQuestionIndex + 1}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {currentQuestion.points} pts
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div 
                    style={{ color: '#1f2937', lineHeight: '1.5', fontSize: '0.95rem' }}
                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentQuestion.type === "MULTIPLE_CHOICE" && (
                    <>
                      {currentQuestion.choices.map((choice: any, choiceIndex: number) => (
                        <label 
                          key={choiceIndex}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '0.6rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            checked={answers[currentQuestion._id] === choice.text}
                            onChange={() => handleAnswerChange(currentQuestion._id, choice.text)}
                            style={{ width: '1rem', height: '1rem', marginRight: '0.75rem' }}
                          />
                          <span style={{ color: '#1f2937', fontSize: '0.9rem' }}>{choice.text}</span>
                        </label>
                      ))}
                    </>
                  )}

                  {currentQuestion.type === "TRUE_FALSE" && (
                    <>
                      <label 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '0.6rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={answers[currentQuestion._id] === true}
                          onChange={() => handleAnswerChange(currentQuestion._id, true)}
                          style={{ width: '1rem', height: '1rem', marginRight: '0.75rem' }}
                        />
                        <span>True</span>
                      </label>
                      <label 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '0.6rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={answers[currentQuestion._id] === false}
                          onChange={() => handleAnswerChange(currentQuestion._id, false)}
                          style={{ width: '1rem', height: '1rem', marginRight: '0.75rem' }}
                        />
                        <span>False</span>
                      </label>
                    </>
                  )}

                  {currentQuestion.type === "FILL_BLANK" && (
                    <input
                      type="text"
                      value={answers[currentQuestion._id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      placeholder="Type your answer here"
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Button
                variant="outline-secondary"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                size="sm"
              >
                ← Previous
              </Button>
              
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button variant="danger" onClick={handleSubmit} size="sm">
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={handleNext}
                  size="sm"
                >
                  Next →
                </Button>
              )}
            </div>

            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Quiz in progress - {formatDateTime(new Date())}
              </span>
            </div>
          </div>
        </div>

        {showSidebar && (
          <div 
            style={{ 
              position: 'fixed',
              right: 0,
              top: 0,
              width: '220px',
              height: '100vh',
              backgroundColor: 'white',
              borderLeft: '1px solid #dee2e6',
              overflowY: 'auto',
              boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
              display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'block' : 'none'
            }}
          >
            <div style={{ padding: '1.5rem 1rem' }}>
              <h3 style={{ 
                fontWeight: '500', 
                fontSize: '1.25rem', 
                marginBottom: '1rem',
                color: '#1f2937',
                paddingLeft: '0.5rem'
              }}>
                Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {quiz.questions?.map((question: any, index: number) => (
                  <button
                    key={question._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '0.25rem',
                      backgroundColor: currentQuestionIndex === index ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentQuestionIndex !== index) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentQuestionIndex !== index) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span 
                      style={{ 
                        marginRight: '0.5rem',
                        fontSize: '1rem',
                        color: answers[question._id] !== undefined ? '#dc2626' : '#9ca3af',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid currentColor'
                      }}
                    >
                      {answers[question._id] !== undefined ? '✓' : '?'}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.95rem',
                        color: '#dc2626',
                        fontWeight: currentQuestionIndex === index ? '500' : '400'
                      }}
                    >
                      Question {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}