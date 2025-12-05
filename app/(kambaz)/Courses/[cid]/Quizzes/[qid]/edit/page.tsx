"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav, Tab, Badge, Dropdown } from "react-bootstrap";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBan } from "react-icons/fa";
import * as client from "../../client";
import QuizDetailsEditor from "./QuizDetailsEditor";
import QuestionsEditor from "./QuestionsEditor";

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

  const handleDuplicate = async () => {
    try {
      const duplicatedQuiz = {
        ...quiz,
        title: `${quiz.title} (Copy)`,
        published: false,
      };
      delete duplicatedQuiz._id;
      const newQuiz = await client.createQuizForCourse(cid, duplicatedQuiz);
      router.push(`/Courses/${cid}/Quizzes/${newQuiz._id}/edit`);
    } catch (error) {
      console.error("Error duplicating quiz:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await client.deleteQuiz(qid);
        router.push(`/Courses/${cid}/Quizzes`);
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  if (!quiz) return <div className="p-4">Loading...</div>;

  const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;

  return (
    <div id="wd-quiz-editor">
      {/* Header with Points and Status */}
      <div className="d-flex justify-content-end align-items-center mb-3 pe-4 gap-3 pt-3">
        <span>Points {totalPoints}</span>
        {!quiz.published && (
          <Badge bg="light" text="dark" className="px-3 py-2 border">
            <FaBan className="me-2" />
            Not Published
          </Badge>
        )}
        
        {/* Three Dots Menu */}
        <Dropdown>
          <Dropdown.Toggle 
            variant="link" 
            className="text-dark p-0"
            style={{ boxShadow: 'none', textDecoration: 'none' }}
          >
            <BsThreeDotsVertical className="fs-5" />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
              Show Rubric
            </Dropdown.Item>
            <Dropdown.Item onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/preview`)}>
              Preview
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDuplicate}>
              Duplicate
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleDelete} className="text-danger">
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="px-4">
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "details")}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link 
                eventKey="details" 
                className={activeTab === "details" ? "text-dark" : "text-danger"}
              >
                Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="questions" 
                className={activeTab === "questions" ? "text-dark" : "text-danger"}
              >
                Questions
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="details">
              <QuizDetailsEditor quiz={quiz} setQuiz={setQuiz} />
            </Tab.Pane>

            <Tab.Pane eventKey="questions">
              <QuestionsEditor quiz={quiz} setQuiz={setQuiz} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}