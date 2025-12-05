"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { BsTypeBold, BsTypeItalic, BsTypeUnderline } from "react-icons/bs";

export default function QuestionsEditor({ 
  quiz, 
  setQuiz 
}: { 
  quiz: any; 
  setQuiz: (quiz: any) => void;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");

  const handleAddQuestion = () => {
    const newQuestion: any = {
      _id: `temp-${Date.now()}`,
      type: questionType,
      title: questionType === "MULTIPLE_CHOICE" ? "Easy Question" : 
             questionType === "TRUE_FALSE" ? "Is 2 + 2 = 4?" : 
             "Easy fill the blank",
      points: questionType === "TRUE_FALSE" ? 3 : 4,
      question: questionType === "MULTIPLE_CHOICE" ? "How much is 2 + 2?" : 
                questionType === "TRUE_FALSE" ? "Is is true that 2 + 2 = 4?" : 
                "How much is 2 + 2 = _______?",
    };

    if (questionType === "MULTIPLE_CHOICE") {
      newQuestion.choices = [
        { text: "4", isCorrect: false },
        { text: "3", isCorrect: false },
        { text: "5", isCorrect: true },
        { text: "7", isCorrect: false },
      ];
    } else if (questionType === "TRUE_FALSE") {
      newQuestion.correctAnswer = true;
    } else if (questionType === "FILL_BLANK") {
      newQuestion.possibleAnswers = ["4", "four", "Four"];
      newQuestion.caseSensitive = false;
    }

    setQuiz({
      ...quiz,
      questions: [...(quiz.questions || []), newQuestion],
    });
    setEditingQuestionId(newQuestion._id);
  };

  const handleSaveQuestion = (question: any) => {
    const updatedQuestions = quiz.questions.map((q: any) =>
      q._id === question._id ? question : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuiz({
        ...quiz,
        questions: quiz.questions.filter((q: any) => q._id !== questionId),
      });
    }
  };

  const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;

  return (
    <div>
      {/* Only show header when not editing any question */}
      {!editingQuestionId && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Total Points: {totalPoints}</h5>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="FILL_BLANK">Fill in the Blank</option>
              </Form.Select>
              <Button variant="danger" onClick={handleAddQuestion}>
                + New Question
              </Button>
            </div>
          </div>

          {(!quiz.questions || quiz.questions.length === 0) && (
            <div className="text-center p-5 border rounded bg-light">
              <p className="text-muted">No questions yet. Click &quot;+ New Question&quot; to add one.</p>
            </div>
          )}
        </>
      )}

      {/* Questions List or Editor */}
      <div>
        {quiz.questions?.map((question: any) => (
          <div key={question._id}>
            {editingQuestionId === question._id ? (
              <QuestionEditor
                question={question}
                onSave={handleSaveQuestion}
                onCancel={() => setEditingQuestionId(null)}
              />
            ) : !editingQuestionId ? (
              <div 
                className="border rounded p-3 mb-3 bg-white"
                style={{ cursor: 'pointer' }}
                onClick={() => setEditingQuestionId(question._id)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-2">
                      {question.title} 
                      <span className="text-muted ms-2">({question.type.replace('_', ' ')})</span>
                    </h6>
                    <p className="text-muted mb-0">{question.question}</p>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted">{question.points} pts</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(question._id);
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}


// Question Editor Component
function QuestionEditor({
  question: initialQuestion,
  onSave,
  onCancel,
}: {
  question: any;
  onSave: (question: any) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [fontSize, setFontSize] = useState("12pt");
  const [textFormat, setTextFormat] = useState("Paragraph");

  const handleAddChoice = () => {
    setQuestion({
      ...question,
      choices: [...(question.choices || []), { text: "", isCorrect: false }],
    });
  };

  const handleRemoveChoice = (index: number) => {
    if (question.choices.length <= 2) return;
    const newChoices = question.choices.filter((_: any, i: number) => i !== index);
    setQuestion({ ...question, choices: newChoices });
  };

  const handleChoiceChange = (index: number, text: string) => {
    const newChoices = [...question.choices];
    newChoices[index].text = text;
    setQuestion({ ...question, choices: newChoices });
  };

  const handleCorrectChoiceChange = (index: number) => {
    const newChoices = question.choices.map((choice: any, i: number) => ({
      ...choice,
      isCorrect: i === index,
    }));
    setQuestion({ ...question, choices: newChoices });
  };

  const handleAddPossibleAnswer = () => {
    setQuestion({
      ...question,
      possibleAnswers: [...(question.possibleAnswers || []), ""],
    });
  };

  const handleRemovePossibleAnswer = (index: number) => {
    if (question.possibleAnswers.length <= 1) return;
    const newAnswers = question.possibleAnswers.filter((_: any, i: number) => i !== index);
    setQuestion({ ...question, possibleAnswers: newAnswers });
  };

  const handlePossibleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...question.possibleAnswers];
    newAnswers[index] = value;
    setQuestion({ ...question, possibleAnswers: newAnswers });
  };

  return (
    <div className="border rounded mb-3 bg-white">
      {/* Question Header */}
      <div className="border-bottom p-3 bg-light">
        <div className="row align-items-center">
          <div className="col-md-4">
            <Form.Control
              type="text"
              value={question.title}
              onChange={(e) => setQuestion({ ...question, title: e.target.value })}
              placeholder="Question Title"
              className="border-secondary"
            />
          </div>
          <div className="col-md-4">
            <Form.Select
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value;
                const updatedQuestion: any = { ...question, type: newType };
                
                if (newType === "MULTIPLE_CHOICE" && !question.choices) {
                  updatedQuestion.choices = [
                    { text: "Option 1", isCorrect: true },
                    { text: "Option 2", isCorrect: false },
                  ];
                } else if (newType === "TRUE_FALSE") {
                  updatedQuestion.correctAnswer = true;
                  delete updatedQuestion.choices;
                  delete updatedQuestion.possibleAnswers;
                } else if (newType === "FILL_BLANK" && !question.possibleAnswers) {
                  updatedQuestion.possibleAnswers = [""];
                  updatedQuestion.caseSensitive = false;
                  delete updatedQuestion.choices;
                  delete updatedQuestion.correctAnswer;
                }
                
                setQuestion(updatedQuestion);
              }}
              className="border-secondary"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="FILL_BLANK">Fill in the Blank</option>
            </Form.Select>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-nowrap">pts:</span>
              <Form.Control
                type="number"
                value={question.points}
                onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 0 })}
                className="border-secondary"
                style={{ maxWidth: '80px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-4">
        <p className="text-muted mb-3">
          {question.type === "MULTIPLE_CHOICE" && "Enter your question and multiple answers, then select the one correct answer."}
          {question.type === "TRUE_FALSE" && "Enter your question text, then select if True or False is the correct answer."}
          {question.type === "FILL_BLANK" && "Enter your question text, then define all possible correct answers for the blank. Students will see the question followed by a small text box to type their answer."}
        </p>

        {/* Question Text Editor */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Question:</Form.Label>
          
          {/* Menu bar */}
          <div className="border border-bottom-0 p-2 bg-light d-flex align-items-center gap-3" style={{ fontSize: '0.875rem' }}>
            <span className="text-muted">Edit</span>
            <span className="text-muted">View</span>
            <span className="text-muted">Insert</span>
            <span className="text-muted">Format</span>
            <span className="text-muted">Tools</span>
            <span className="text-muted">Table</span>
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
            </Form.Select>
            
            <Form.Select 
              size="sm"
              value={textFormat}
              onChange={(e) => setTextFormat(e.target.value)}
              style={{ width: '120px' }}
            >
              <option value="Paragraph">Paragraph</option>
              <option value="Heading 1">Heading 1</option>
              <option value="Heading 2">Heading 2</option>
            </Form.Select>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1" title="Bold">
              <BsTypeBold />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1" title="Italic">
              <BsTypeItalic />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1" title="Underline">
              <BsTypeUnderline />
            </Button>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1">A</Button>
            <Button variant="light" size="sm" className="border-0 p-1">🖊️</Button>
            <Button variant="light" size="sm" className="border-0 p-1">T²</Button>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1">⋮</Button>
          </div>

          {/* Text area */}
          <Form.Control
            as="textarea"
            rows={4}
            value={question.question}
            onChange={(e) => setQuestion({ ...question, question: e.target.value })}
            className="border-top-0 rounded-0 rounded-bottom"
            style={{ fontSize: fontSize }}
          />
        </Form.Group>

        {/* Answers Section */}
        <Form.Group>
          <Form.Label className="fw-semibold mb-3">Answers:</Form.Label>

          {question.type === "MULTIPLE_CHOICE" && (
            <div>
              {question.choices?.map((choice: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: '150px' }}>
                      {choice.isCorrect ? (
                        <span className="text-success d-flex align-items-center gap-2">
                          <span style={{ fontSize: '1.2rem' }}>➜</span>
                          <strong>Correct Answer</strong>
                        </span>
                      ) : (
                        <span className="text-muted d-flex align-items-center gap-2">
                          <span style={{ fontSize: '1.2rem' }}>➜</span>
                          Possible Answer
                        </span>
                      )}
                    </div>
                    <Form.Control
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      placeholder={`Answer ${index + 1}`}
                      className="flex-grow-1"
                    />
                    <div className="d-flex gap-2">
                      {!choice.isCorrect && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-muted p-0"
                          onClick={() => handleCorrectChoiceChange(index)}
                          title="Mark as correct"
                        >
                          ✓
                        </Button>
                      )}
                      {question.choices.length > 2 && (
                        <>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-muted p-0"
                            title="Edit"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => handleRemoveChoice(index)}
                            title="Delete"
                          >
                            🗑️
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none"
                  onClick={handleAddChoice}
                >
                  + Add Another Answer
                </Button>
              </div>
            </div>
          )}

          {question.type === "TRUE_FALSE" && (
            <div>
              <div className="mb-2 d-flex align-items-center gap-2">
                {question.correctAnswer === true ? (
                  <span className="text-success d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>➜</span>
                    <strong>True</strong>
                  </span>
                ) : (
                  <span className="text-muted d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>➜</span>
                    True
                  </span>
                )}
                {question.correctAnswer !== true && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-muted p-0 ms-auto"
                    onClick={() => setQuestion({ ...question, correctAnswer: true })}
                  >
                    Set as correct
                  </Button>
                )}
              </div>
              <div className="mb-2 d-flex align-items-center gap-2">
                {question.correctAnswer === false ? (
                  <span className="text-success d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>➜</span>
                    <strong>False</strong>
                  </span>
                ) : (
                  <span className="text-muted d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>➜</span>
                    False
                  </span>
                )}
                {question.correctAnswer !== false && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-muted p-0 ms-auto"
                    onClick={() => setQuestion({ ...question, correctAnswer: false })}
                  >
                    Set as correct
                  </Button>
                )}
              </div>
            </div>
          )}

          {question.type === "FILL_BLANK" && (
            <div>
              {question.possibleAnswers?.map((answer: string, index: number) => (
                <div key={index} className="mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: '150px' }}>
                      <span className="text-muted">Possible Answer:</span>
                    </div>
                    <Form.Control
                      type="text"
                      value={answer}
                      onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                      placeholder={`Answer ${index + 1}`}
                      className="flex-grow-1"
                    />
                    {question.possibleAnswers.length > 1 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => handleRemovePossibleAnswer(index)}
                        title="Delete"
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none"
                  onClick={handleAddPossibleAnswer}
                >
                  + Add Another Answer
                </Button>
              </div>
            </div>
          )}
        </Form.Group>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-4 pt-3 border-top">
          <Button 
            variant="light" 
            className="border px-4"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="px-4"
            onClick={() => onSave(question)}
          >
            Update Question
          </Button>
        </div>
      </div>
    </div>
  );
}