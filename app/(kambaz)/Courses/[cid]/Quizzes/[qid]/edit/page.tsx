"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Nav, Tab } from "react-bootstrap";
import * as client from "../../client";

export default function QuizEditor() {
  const params = useParams();
  const router = useRouter();
  const cid = params.cid as string;
  const qid = params.qid as string;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");

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

  const handleSave = async () => {
    try {
      await client.updateQuiz(quiz);
      router.push(`/Courses/${cid}/Quizzes/${qid}`); // FIXED
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleSaveAndPublish = async () => {
    try {
      await client.updateQuiz({ ...quiz, published: true });
      await client.publishQuiz(qid);
      router.push(`/Courses/${cid}/Quizzes`); // FIXED
    } catch (error) {
      console.error("Error saving and publishing quiz:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Quizzes`); // FIXED
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div id="wd-quiz-editor" className="p-4">
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "details")}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="details">Details</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="questions">Questions</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={quiz.description || ""}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quiz Type</Form.Label>
                <Form.Select
                  value={quiz.quizType}
                  onChange={(e) => setQuiz({ ...quiz, quizType: e.target.value })}
                >
                  <option value="GRADED_QUIZ">Graded Quiz</option>
                  <option value="PRACTICE_QUIZ">Practice Quiz</option>
                  <option value="GRADED_SURVEY">Graded Survey</option>
                  <option value="UNGRADED_SURVEY">Ungraded Survey</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assignment Group</Form.Label>
                <Form.Select
                  value={quiz.assignmentGroup}
                  onChange={(e) => setQuiz({ ...quiz, assignmentGroup: e.target.value })}
                >
                  <option value="QUIZZES">Quizzes</option>
                  <option value="EXAMS">Exams</option>
                  <option value="ASSIGNMENTS">Assignments</option>
                  <option value="PROJECT">Project</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Time Limit (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Shuffle Answers"
                  checked={quiz.shuffleAnswers}
                  onChange={(e) => setQuiz({ ...quiz, shuffleAnswers: e.target.checked })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Multiple Attempts"
                  checked={quiz.multipleAttempts}
                  onChange={(e) => setQuiz({ ...quiz, multipleAttempts: e.target.checked })}
                />
              </Form.Group>

              {quiz.multipleAttempts && (
                <Form.Group className="mb-3">
                  <Form.Label>How Many Attempts</Form.Label>
                  <Form.Control
                    type="number"
                    value={quiz.howManyAttempts}
                    onChange={(e) => setQuiz({ ...quiz, howManyAttempts: parseInt(e.target.value) })}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Available From</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={quiz.availableDate ? new Date(quiz.availableDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setQuiz({ ...quiz, availableDate: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Until</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={quiz.untilDate ? new Date(quiz.untilDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setQuiz({ ...quiz, untilDate: e.target.value })}
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <Button variant="light" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="danger" onClick={handleSaveAndPublish}>
                  Save & Publish
                </Button>
              </div>
            </Form>
          </Tab.Pane>

          <Tab.Pane eventKey="questions">
            <QuestionsEditor quiz={quiz} setQuiz={setQuiz} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

// Questions Editor Component
function QuestionsEditor({ quiz, setQuiz }: { quiz: any; setQuiz: (quiz: any) => void }) {
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");

  const handleAddQuestion = async () => {
    const newQuestion: any = {
      type: questionType,
      title: "New Question",
      points: 1,
      question: "Question text",
    };

    if (questionType === "MULTIPLE_CHOICE") {
      newQuestion.choices = [
        { text: "Option 1", isCorrect: true },
        { text: "Option 2", isCorrect: false },
      ];
    } else if (questionType === "TRUE_FALSE") {
      newQuestion.correctAnswer = true;
    } else if (questionType === "FILL_BLANK") {
      newQuestion.possibleAnswers = [""];
      newQuestion.caseSensitive = false;
    }

    try {
      const addedQuestion = await client.addQuestionToQuiz(quiz._id, newQuestion);
      setQuiz({
        ...quiz,
        questions: [...(quiz.questions || []), addedQuestion],
      });
      setEditingQuestion(addedQuestion);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleSaveQuestion = async (question: any) => {
    try {
      await client.updateQuestion(quiz._id, question._id, question);
      const updatedQuestions = quiz.questions.map((q: any) =>
        q._id === question._id ? question : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await client.deleteQuestion(quiz._id, questionId);
        setQuiz({
          ...quiz,
          questions: quiz.questions.filter((q: any) => q._id !== questionId),
        });
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Points: {totalPoints}</h4>
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

      {quiz.questions?.length === 0 ? (
        <div className="text-center p-5 border rounded">
          <p className="text-muted">No questions yet. Click &quot;+ New Question&quot; to add one.</p>
        </div>
      ) : (
        <div className="list-group">
          {quiz.questions?.map((question: any, index: number) => (
            <div key={question._id} className="list-group-item">
              {editingQuestion?._id === question._id ? (
                <QuestionEditor
                  question={editingQuestion}
                  onSave={handleSaveQuestion}
                  onCancel={() => setEditingQuestion(null)}
                  onChange={setEditingQuestion}
                />
              ) : (
                <div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>Question {index + 1}</strong> ({question.type}) - {question.points} pts
                      <div className="mt-2">{question.question}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  onSave,
  onCancel,
  onChange,
}: {
  question: any;
  onSave: (question: any) => void;
  onCancel: () => void;
  onChange: (question: any) => void;
}) {
  const handleAddChoice = () => {
    onChange({
      ...question,
      choices: [...question.choices, { text: "", isCorrect: false }],
    });
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = question.choices.filter((_: any, i: number) => i !== index);
    onChange({ ...question, choices: newChoices });
  };

  const handleChoiceChange = (index: number, text: string) => {
    const newChoices = [...question.choices];
    newChoices[index].text = text;
    onChange({ ...question, choices: newChoices });
  };

  const handleCorrectChoiceChange = (index: number) => {
    const newChoices = question.choices.map((choice: any, i: number) => ({
      ...choice,
      isCorrect: i === index,
    }));
    onChange({ ...question, choices: newChoices });
  };

  const handleAddPossibleAnswer = () => {
    onChange({
      ...question,
      possibleAnswers: [...question.possibleAnswers, ""],
    });
  };

  const handleRemovePossibleAnswer = (index: number) => {
    const newAnswers = question.possibleAnswers.filter((_: any, i: number) => i !== index);
    onChange({ ...question, possibleAnswers: newAnswers });
  };

  const handlePossibleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...question.possibleAnswers];
    newAnswers[index] = value;
    onChange({ ...question, possibleAnswers: newAnswers });
  };

  return (
    <div className="p-3 border rounded">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={question.title}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Points</Form.Label>
          <Form.Control
            type="number"
            value={question.points}
            onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Question</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={question.question}
            onChange={(e) => onChange({ ...question, question: e.target.value })}
          />
        </Form.Group>

        {question.type === "MULTIPLE_CHOICE" && (
          <div className="mb-3">
            <Form.Label>Choices</Form.Label>
            {question.choices.map((choice: any, index: number) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Check
                  type="radio"
                  name="correctChoice"
                  checked={choice.isCorrect}
                  onChange={() => handleCorrectChoiceChange(index)}
                />
                <Form.Control
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveChoice(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="light" size="sm" onClick={handleAddChoice}>
              + Add Choice
            </Button>
          </div>
        )}

        {question.type === "TRUE_FALSE" && (
          <Form.Group className="mb-3">
            <Form.Label>Correct Answer</Form.Label>
            <Form.Check
              type="radio"
              label="True"
              name="trueFalse"
              checked={question.correctAnswer === true}
              onChange={() => onChange({ ...question, correctAnswer: true })}
            />
            <Form.Check
              type="radio"
              label="False"
              name="trueFalse"
              checked={question.correctAnswer === false}
              onChange={() => onChange({ ...question, correctAnswer: false })}
            />
          </Form.Group>
        )}

        {question.type === "FILL_BLANK" && (
          <div className="mb-3">
            <Form.Label>Possible Answers</Form.Label>
            {question.possibleAnswers.map((answer: string, index: number) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={answer}
                  onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                  placeholder={`Answer ${index + 1}`}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemovePossibleAnswer(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="light" size="sm" onClick={handleAddPossibleAnswer}>
              + Add Answer
            </Button>
            <Form.Check
              type="checkbox"
              label="Case Sensitive"
              checked={question.caseSensitive}
              onChange={(e) => onChange({ ...question, caseSensitive: e.target.checked })}
              className="mt-2"
            />
          </div>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSave(question)}>
            Update Question
          </Button>
        </div>
      </Form>
    </div>
  );
}