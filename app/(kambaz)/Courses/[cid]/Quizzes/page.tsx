"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import { FaCheckCircle, FaBan } from "react-icons/fa";
import { BsRocketTakeoff } from "react-icons/bs";
import * as client from "./client";
import { setQuizzes, deleteQuiz as deleteQuizAction, updateQuiz } from "./reducer";
import Link from "next/link";

export default function Quizzes() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const cid = params.cid as string;
  
  const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  
  const isFaculty = currentUser?.role === "FACULTY";
  
  const filteredQuizzes = quizzes.filter((quiz: any) => quiz.course === cid);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzes = await client.findQuizzesForCourse(cid);
        dispatch(setQuizzes(quizzes));
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, [cid, dispatch]);

  const handleAddQuiz = async () => {
    try {
      const newQuiz = await client.createQuizForCourse(cid, {
        title: "Unnamed Quiz",
        description: "New quiz description",
      });
      dispatch(setQuizzes([...quizzes, newQuiz]));
      router.push(`/Courses/${cid}/Quizzes/${newQuiz._id}/edit`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await client.deleteQuiz(quizId);
        dispatch(deleteQuizAction(quizId));
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handlePublishToggle = async (quiz: any) => {
    try {
      if (quiz.published) {
        await client.unpublishQuiz(quiz._id);
        dispatch(updateQuiz({ ...quiz, published: false }));
      } else {
        await client.publishQuiz(quiz._id);
        dispatch(updateQuiz({ ...quiz, published: true }));
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const getAvailabilityStatus = (quiz: any) => {
    const now = new Date();
    const availableDate = new Date(quiz.availableDate);
    const untilDate = new Date(quiz.untilDate);

    if (now < availableDate) {
      return `Not available until ${availableDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${availableDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (now > untilDate) {
      return "Closed";
    } else {
      return "Available";
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day} at ${time}`;
  };

  if (filteredQuizzes.length === 0 && !isFaculty) {
    return (
      <div id="wd-quizzes" className="p-4">
        <h3>No quizzes available</h3>
      </div>
    );
  }

  return (
    <div id="wd-quizzes" className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search for Quiz"
            style={{ width: "300px" }}
          />
        </div>
        {isFaculty && (
          <Button variant="danger" onClick={handleAddQuiz}>
            <BsPlus className="fs-4" /> Quiz
          </Button>
        )}
      </div>

      {filteredQuizzes.length === 0 && isFaculty ? (
        <div className="text-center p-5 border rounded">
          <p className="text-muted">No quizzes yet. Click the &quot;+ Quiz&quot; button to create one.</p>
        </div>
      ) : (
        <div className="border rounded">
          <ul className="list-group rounded-0">
            <li className="list-group-item p-3 bg-light">
              <strong>Assignment Quizzes</strong>
            </li>
            {filteredQuizzes.map((quiz: any, index: number) => (
              <li 
                key={quiz._id} 
              className="list-group-item p-3 ps-1 border-0 border-start border-success border-5"
              >
                <div className="d-flex align-items-start">
                  <BsRocketTakeoff className="me-3 fs-5 text-success" />
                  
                  <div className="flex-grow-1">
                    <Link
                      href={`/Courses/${cid}/Quizzes/${quiz._id}`}
                      className="text-decoration-none text-dark fw-bold"
                    >
                      {quiz.title}
                    </Link>
                    <div className="text-muted small mt-1">
                      {getAvailabilityStatus(quiz)} | <strong>Due</strong> {formatDueDate(quiz.dueDate)} | {quiz.points} pts | {quiz.questions?.length || 0} Questions
                    </div>
                  </div>

                  {/* Published Status Icon on Right */}
                  <div className="d-flex align-items-center gap-2">
                    {quiz.published ? (
                      <FaCheckCircle className="text-success fs-5" />
                    ) : (
                      <FaBan className="text-danger fs-5" />
                    )}
                    
                    {/* Three Dots Menu */}
                    {isFaculty && (
                      <Dropdown>
                        <Dropdown.Toggle variant="link" className="text-dark p-0">
                          <BsThreeDotsVertical className="fs-5" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => router.push(`/Courses/${cid}/Quizzes/${quiz._id}/edit`)}>
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(quiz._id)}>
                            Delete
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handlePublishToggle(quiz)}>
                            {quiz.published ? "Unpublish" : "Publish"}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </div>
                {index < filteredQuizzes.length - 1 && <hr className="mt-3 mb-0" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}