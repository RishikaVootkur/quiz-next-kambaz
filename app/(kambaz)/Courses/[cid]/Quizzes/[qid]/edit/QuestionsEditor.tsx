"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { BsTypeBold, BsTypeItalic, BsTypeUnderline, BsPencil, BsTrash } from "react-icons/bs";

export default function QuestionsEditor({ 
  quiz, 
  setQuiz 
}: { 
  quiz: any; 
  setQuiz: (quiz: any) => void;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleAddQuestion = () => {
    // Always create Multiple Choice question by default
    const newQuestion: any = {
      _id: `temp-${Date.now()}`,
      type: "MULTIPLE_CHOICE",
      title: "Easy Question",
      points: 4,
      question: "How much is 2 + 2?",
      choices: [
        { text: "4", isCorrect: false },
        { text: "3", isCorrect: false },
        { text: "5", isCorrect: true },
        { text: "7", isCorrect: false },
      ],
    };

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

  const handleCancelEdit = (questionId: string) => {
    // Check if this is a new question (temp ID) that hasn't been saved
    if (questionId.startsWith('temp-')) {
      // Remove the unsaved question
      setQuiz({
        ...quiz,
        questions: quiz.questions.filter((q: any) => q._id !== questionId),
      });
    }
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
      {/* Only show header when not editing */}
      {!editingQuestionId && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Total Points: {totalPoints}</h5>
            <Button variant="danger" onClick={handleAddQuestion}>
              + New Question
            </Button>
          </div>

          {(!quiz.questions || quiz.questions.length === 0) && (
            <div className="text-center p-5 border rounded bg-light">
              <p className="text-muted">No questions yet. Click &quot;+ New Question&quot; to add one.</p>
            </div>
          )}
        </>
      )}

      {/* Questions List */}
      <div>
        {quiz.questions?.map((question: any) => (
          <div key={question._id}>
            {editingQuestionId === question._id ? (
              <QuestionEditor
                question={question}
                onSave={handleSaveQuestion}
                onCancel={() => handleCancelEdit(question._id)}
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
                      <BsTrash size={18} />
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
    <div className="border rounded mb-3 bg-white" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="border-bottom p-3 bg-light">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <Form.Control
              type="text"
              value={question.title}
              onChange={(e) => setQuestion({ ...question, title: e.target.value })}
              placeholder="Question Title"
              size="sm"
            />
          </div>
          <div className="col-md-5">
            <Form.Select
              value={question.type}
              size="sm"
              onChange={(e) => {
                const newType = e.target.value;
                const updatedQuestion: any = { ...question, type: newType };
                
                if (newType === "MULTIPLE_CHOICE" && !question.choices) {
                  updatedQuestion.choices = [
                    { text: "", isCorrect: true },
                    { text: "", isCorrect: false },
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
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="FILL_BLANK">Fill in the Blank</option>
            </Form.Select>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center justify-content-end gap-2">
              <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>pts:</span>
              <Form.Control
                type="number"
                value={question.points}
                onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 0 })}
                size="sm"
                style={{ width: '70px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-muted small mb-3">
          {question.type === "MULTIPLE_CHOICE" && "Enter your question and multiple answers, then select the one correct answer."}
          {question.type === "TRUE_FALSE" && "Enter your question text, then select if True or False is the correct answer."}
          {question.type === "FILL_BLANK" && "Enter your question text, then define all possible correct answers for the blank. Students will see the question followed by a small text box to type their answer."}
        </p>

        {/* Question Editor */}
        <Form.Group className="mb-4">
          <Form.Label style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Question:</Form.Label>
          
          <div className="border border-bottom-0 p-2 bg-light d-flex align-items-center gap-3" style={{ fontSize: '0.85rem' }}>
            <span className="text-muted">Edit</span>
            <span className="text-muted">View</span>
            <span className="text-muted">Insert</span>
            <span className="text-muted">Format</span>
            <span className="text-muted">Tools</span>
            <span className="text-muted">Table</span>
          </div>

          <div className="border border-top-0 border-bottom-0 p-2 bg-white d-flex align-items-center gap-2 flex-wrap">
            <Form.Select 
              size="sm" 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{ width: '75px' }}
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
              style={{ width: '110px' }}
            >
              <option value="Paragraph">Paragraph</option>
              <option value="Heading 1">Heading 1</option>
              <option value="Heading 2">Heading 2</option>
            </Form.Select>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Bold">
              <BsTypeBold />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Italic">
              <BsTypeItalic />
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2" title="Underline">
              <BsTypeUnderline />
            </Button>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1 px-2">
              <span style={{ fontWeight: 'bold' }}>A</span>
            </Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2">✏️</Button>
            <Button variant="light" size="sm" className="border-0 p-1 px-2">T²</Button>
            
            <div className="vr"></div>
            
            <Button variant="light" size="sm" className="border-0 p-1 px-2">⋮</Button>
          </div>

          <Form.Control
            as="textarea"
            rows={3}
            value={question.question}
            onChange={(e) => setQuestion({ ...question, question: e.target.value })}
            className="border-top-0 rounded-0 rounded-bottom"
            style={{ fontSize: fontSize }}
          />
        </Form.Group>

        {/* Answers */}
        <Form.Group>
          <Form.Label style={{ fontWeight: '600', marginBottom: '1rem' }}>Answers:</Form.Label>

          {/* MULTIPLE CHOICE */}
          {question.type === "MULTIPLE_CHOICE" && (
            <div>
              {question.choices?.map((choice: any, index: number) => (
                <div key={index} className="row mb-3 align-items-center">
                  <div className="col-auto" style={{ minWidth: '180px' }}>
                    {choice.isCorrect ? (
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ color: '#28a745', fontSize: '1.3rem' }}>➜</span>
                        <span style={{ color: '#28a745', fontWeight: '600' }}>Correct Answer</span>
                      </div>
                    ) : (
                      <div 
                        className="d-flex align-items-center gap-2" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCorrectChoiceChange(index)}
                      >
                        <span style={{ color: 'transparent', fontSize: '1.3rem' }}>➜</span>
                        <span style={{ color: '#666' }}>Possible Answer</span>
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <Form.Control
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      size="sm"
                    />
                  </div>
                  <div className="col-auto">
                    {question.choices.length > 2 && (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          style={{ fontSize: '1.2rem', textDecoration: 'none', color: '#0d6efd' }}
                          title="Edit"
                        >
                          <BsPencil />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          style={{ fontSize: '1.2rem', textDecoration: 'none', color: '#dc3545' }}
                          onClick={() => handleRemoveChoice(index)}
                          title="Delete"
                        >
                          <BsTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none"
                  size="sm"
                  onClick={handleAddChoice}
                >
                  + Add Another Answer
                </Button>
              </div>
            </div>
          )}

          {/* TRUE FALSE */}
          {question.type === "TRUE_FALSE" && (
            <div>
              <div 
                className="d-flex align-items-center gap-3 mb-2 p-2 rounded"
                style={{ cursor: question.correctAnswer !== true ? 'pointer' : 'default' }}
                onClick={() => question.correctAnswer !== true && setQuestion({ ...question, correctAnswer: true })}
              >
                <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                  {question.correctAnswer === true ? (
                    <>
                      <span style={{ color: '#28a745', fontSize: '1.3rem' }}>➜</span>
                      <span style={{ color: '#28a745', fontWeight: '600' }}>True</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: 'transparent', fontSize: '1.3rem' }}>➜</span>
                      <span style={{ color: '#666' }}>True</span>
                    </>
                  )}
                </div>
              </div>
              <div 
                className="d-flex align-items-center gap-3 p-2 rounded"
                style={{ cursor: question.correctAnswer !== false ? 'pointer' : 'default' }}
                onClick={() => question.correctAnswer !== false && setQuestion({ ...question, correctAnswer: false })}
              >
                <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                  {question.correctAnswer === false ? (
                    <>
                      <span style={{ color: '#28a745', fontSize: '1.3rem' }}>➜</span>
                      <span style={{ color: '#28a745', fontWeight: '600' }}>False</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: 'transparent', fontSize: '1.3rem' }}>➜</span>
                      <span style={{ color: '#666' }}>False</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FILL BLANK */}
          {question.type === "FILL_BLANK" && (
            <div>
              {question.possibleAnswers?.map((answer: string, index: number) => (
                <div key={index} className="row mb-3 align-items-center">
                  <div className="col-auto" style={{ minWidth: '150px' }}>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Possible Answer:</span>
                  </div>
                  <div className="col">
                    <Form.Control
                      type="text"
                      value={answer}
                      onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                      size="sm"
                    />
                  </div>
                  <div className="col-auto">
                    {question.possibleAnswers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        style={{ fontSize: '1.2rem', textDecoration: 'none', color: '#dc3545' }}
                        onClick={() => handleRemovePossibleAnswer(index)}
                        title="Delete"
                      >
                        <BsTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none"
                  size="sm"
                  onClick={handleAddPossibleAnswer}
                >
                  + Add Another Answer
                </Button>
              </div>
            </div>
          )}
        </Form.Group>

        {/* Buttons */}
        <div className="d-flex gap-2 mt-4 pt-3">
          <Button variant="light" className="border" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSave(question)}>
            Update Question
          </Button>
        </div>
      </div>
    </div>
  );
}