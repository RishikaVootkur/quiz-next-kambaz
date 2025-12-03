"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import { FaCheckCircle, FaBan } from "react-icons/fa";
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
      router.push(`/Courses/${cid}/Quizzes/${newQuiz._id}/edit`); // FIXED
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
      return `Not available until ${availableDate.toLocaleDateString()}`;
    } else if (now > untilDate) {
      return "Closed";
    } else {
      return "Available";
    }
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
        <div className="list-group">
          <div className="list-group-item bg-light">
            <strong>Assignment Quizzes</strong>
          </div>
          {filteredQuizzes.map((quiz: any) => (
            <div key={quiz._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    {quiz.published ? (
                      <FaCheckCircle className="text-success" />
                    ) : (
                      <FaBan className="text-danger" />
                    )}
                    <Link
                      href={`/Courses/${cid}/Quizzes/${quiz._id}`}
                      className="text-decoration-none text-dark fw-bold"
                    >
                      {quiz.title}
                    </Link>
                  </div>
                  <div className="text-muted small mt-2">
                    <div>{getAvailabilityStatus(quiz)}</div>
                    <div>
                      <strong>Due</strong> {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "No due date"} | {quiz.points} pts | {quiz.questions?.length || 0} Questions
                    </div>
                  </div>
                </div>
                {isFaculty && (
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className="text-dark">
                      <BsThreeDotsVertical />
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
          ))}
        </div>
      )}
    </div>
  );
}