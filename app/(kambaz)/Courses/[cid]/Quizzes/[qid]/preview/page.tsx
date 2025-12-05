"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [startTime] = useState(new Date());

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

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const parseQuestionText = (text: string) => {
    const keywords = ['label', 'input', 'HTML', 'id', 'for', 'click', 'focus', 'element', 'attribute'];
    let formatted = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `**${keyword}**`);
    });
    
    return formatted;
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!quiz) return <div className="p-4">Loading...</div>;

  if (showResults) {
    return (
      <div id="wd-quiz-preview" className="p-4">
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
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div id="wd-quiz-preview" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ display: 'flex' }}>
        {/* Main Content */}
        <div 
          style={{ 
            flex: 1, 
            marginRight: showSidebar ? '220px' : '0',
            transition: 'margin-right 0.3s ease'
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Header */}
            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                  {quiz.title}
                </h1>
                
                <div 
                  style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '0.25rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{ color: '#dc2626', marginRight: '0.5rem' }}>ⓘ</span>
                  <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                    This is a preview of the published version of the quiz
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Started: {formatDateTime(startTime)}
                </div>

                <div>
                  <h2 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    Quiz Instructions
                  </h2>
                  <p style={{ color: '#374151' }}>{quiz.description || 'Complete all questions to the best of your ability.'}</p>
                </div>
              </div>
            </div>

            {/* Current Question */}
            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem', cursor: 'pointer' }}
                      checked={false}
                      readOnly
                    />
                    <h3 style={{ fontWeight: '600', margin: 0 }}>
                      Question {currentQuestionIndex + 1}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {currentQuestion.points} pts
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#1f2937', lineHeight: '1.625' }}>
                    {renderFormattedText(parseQuestionText(currentQuestion.question))}
                  </p>
                </div>

                {/* Answer Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentQuestion.type === "MULTIPLE_CHOICE" && (
                    <>
                      {currentQuestion.choices.map((choice: any, choiceIndex: number) => (
                        <label 
                          key={choiceIndex}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '0.75rem',
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
                          <span style={{ color: '#1f2937' }}>{choice.text}</span>
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
                          padding: '0.75rem',
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
                          padding: '0.75rem',
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
                        fontSize: '1rem'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <Button
                variant="outline-secondary"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                - Previous
              </Button>
              
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button variant="danger" onClick={handleSubmit}>
                  Submit Quiz
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleNext}>
                  Next →
                </Button>
              )}
            </div>

            {/* Footer */}
            <div 
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6', 
                borderRadius: '0.25rem',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Quiz saved at {formatDateTime(new Date())}
              </span>
              <Button
                variant="outline-secondary"
                onClick={() => router.push(`/Kanbas/Courses/${cid}/Quizzes/${qid}/Editor`)}
              >
                ✏️ Keep Editing This Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Questions List */}
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
              display: window.innerWidth >= 768 ? 'block' : 'none'
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
                        color: answers[question._id] ? '#dc2626' : '#9ca3af',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid currentColor'
                      }}
                    >
                      ?
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

        {/* Mobile Toggle Button */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              zIndex: 50,
              display: window.innerWidth < 768 ? 'block' : 'none'
            }}
          >
            ←
          </button>
        )}
      </div>
    </div>
  );
}