"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { BsPlus, BsThreeDotsVertical, BsRocketTakeoff, BsPerson } from "react-icons/bs";
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [studentView, setStudentView] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  
  const isFaculty = currentUser?.role === "FACULTY";
  const isAdmin = currentUser?.role === "ADMIN";
  const canManageQuizzes = isFaculty || isAdmin;
  
  // Filter quizzes
  let displayQuizzes = quizzes
    .filter((quiz: any) => quiz.course === cid)
    .filter((quiz: any) => 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((quiz: any) => {
      if (!canManageQuizzes || studentView) {
        return quiz.published === true;
      }
      return true;
    });

  // Sort quizzes
  if (sortBy === "title") {
    displayQuizzes = [...displayQuizzes].sort((a: any, b: any) => 
      a.title.localeCompare(b.title)
    );
  } else if (sortBy === "dueDate") {
    displayQuizzes = [...displayQuizzes].sort((a: any, b: any) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else if (sortBy === "points") {
    displayQuizzes = [...displayQuizzes].sort((a: any, b: any) => 
      (b.points || 0) - (a.points || 0)
    );
  }

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
        quizType: "GRADED_QUIZ",
        points: 0,
        assignmentGroup: "QUIZZES",
        shuffleAnswers: true,
        timeLimit: 20,
        multipleAttempts: false,
        howManyAttempts: 1,
        showCorrectAnswers: "IMMEDIATELY",
        accessCode: "",
        oneQuestionAtATime: true,
        webcamRequired: false,
        lockQuestionsAfterAnswering: false,
        published: false,
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

  const handleSort = () => {
    if (sortBy === "default") setSortBy("title");
    else if (sortBy === "title") setSortBy("dueDate");
    else if (sortBy === "dueDate") setSortBy("points");
    else setSortBy("default");
  };

  const handleCollapseAll = () => {
    setCollapsed(!collapsed);
  };

  const handleViewProgress = () => {
    alert("View Progress feature - Shows student progress on quizzes");
  };

  const isQuizAvailable = (quiz: any) => {
    if (!quiz.availableDate || !quiz.untilDate) return true;
    
    const now = new Date();
    const availableDate = new Date(quiz.availableDate);
    const untilDate = new Date(quiz.untilDate);

    return now >= availableDate && now <= untilDate;
  };

  const getAvailabilityStatus = (quiz: any) => {
    if (!quiz.availableDate || !quiz.untilDate) return "Available";
    
    const now = new Date();
    const availableDate = new Date(quiz.availableDate);
    const untilDate = new Date(quiz.untilDate);

    if (now < availableDate) {
      const month = availableDate.toLocaleDateString('en-US', { month: 'short' });
      const day = availableDate.getDate();
      const time = availableDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `Not available until ${month} ${day} at ${time}`;
    } else if (now > untilDate) {
      return "Closed";
    } else {
      return "Available";
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate || dueDate === "Multiple Dates") return dueDate || "No due date";
    const date = new Date(dueDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day} at ${time}`;
  };

  const formatAvailability = (quiz: any) => {
    if (quiz.availableDate === "Multiple Dates") {
      return <span className="text-danger fw-bold">Multiple Dates</span>;
    }
    
    const status = getAvailabilityStatus(quiz);
    return status;
  };

  const formatDue = (quiz: any) => {
    if (quiz.dueDate === "Multiple Dates") {
      return <span className="text-danger fw-bold">Multiple Dates</span>;
    }
    return formatDueDate(quiz.dueDate);
  };

  if (displayQuizzes.length === 0 && !canManageQuizzes && !searchTerm) {
    return (
      <div id="wd-quizzes" className="p-4">
        <h3>No quizzes available</h3>
      </div>
    );
  }

  return (
    <div id="wd-quizzes" className="p-4">
      {/* Top Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2 align-items-center flex-grow-1">
          <input
            type="text"
            className="form-control"
            placeholder="Search for Quiz"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>
        
        <div className="d-flex gap-2">
          {canManageQuizzes && (
            <Button 
              variant={studentView ? "primary" : "light"}
              className="border"
              onClick={() => setStudentView(!studentView)}
            >
              <BsPerson className="me-2 fs-5" />
              Student View
            </Button>
          )}
          
          {canManageQuizzes && (
            <Button variant="danger" onClick={handleAddQuiz}>
              <BsPlus className="fs-4" /> Quiz
            </Button>
          )}
          
          {canManageQuizzes && (
            <Dropdown>
              <Dropdown.Toggle 
                variant="light" 
                className="border px-3"
                style={{ boxShadow: 'none' }}
              >
                <BsThreeDotsVertical />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleSort}>
                  Sort {sortBy !== "default" && `(by ${sortBy})`}
                </Dropdown.Item>
                <Dropdown.Item onClick={handleCollapseAll}>
                  {collapsed ? "Expand All" : "Collapse All"}
                </Dropdown.Item>
                <Dropdown.Item onClick={handleViewProgress}>
                  View Progress
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>

      {displayQuizzes.length === 0 ? (
        <div className="text-center p-5 border rounded">
          <p className="text-muted">
            {searchTerm 
              ? "No quizzes match your search." 
              : canManageQuizzes 
                ? 'No quizzes yet. Click the "+ Quiz" button to create one.' 
                : "No quizzes available."}
          </p>
        </div>
      ) : (
        <div className="border rounded">
          <ul className="list-group rounded-0">
            {/* Header with dropdown arrow */}
            <li className="list-group-item p-3 ps-4 bg-light border-0 d-flex align-items-center">
              <span 
                onClick={handleCollapseAll}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span className="me-2">{collapsed ? '▶' : '▼'}</span>
                <strong>Assignment Quizzes</strong>
              </span>
            </li>
            
            {!collapsed && displayQuizzes.map((quiz: any) => {
              const quizAvailable = isQuizAvailable(quiz);
              const availabilityStatus = getAvailabilityStatus(quiz);
              
              return (
                <li 
                  key={quiz._id} 
                  className="list-group-item border-0 border-start border-5 border-success"
                  style={{ borderLeftColor: '#28a745 !important' }}
                >
                  <div className="d-flex align-items-start p-3 ps-2">
                    <BsRocketTakeoff className="me-3 mt-1 fs-5 text-success" />
                    
                    <div className="flex-grow-1">
                      {canManageQuizzes || quizAvailable ? (
                        <Link
                          href={`/Courses/${cid}/Quizzes/${quiz._id}`}
                          className="text-decoration-none text-dark fw-bold"
                        >
                          {quiz.title}
                        </Link>
                      ) : (
                        <span 
                          className="text-dark fw-bold" 
                          style={{ cursor: 'not-allowed', opacity: 0.6 }}
                          title={availabilityStatus}
                        >
                          {quiz.title}
                        </span>
                      )}
                      
                      <div className="small mt-1">
                        <span className={
                          availabilityStatus.includes("Closed") 
                            ? "fw-bold" 
                            : availabilityStatus.includes("Not available") 
                              ? "fw-bold" 
                              : "text-muted"
                        }>
                          {formatAvailability(quiz)}
                        </span>
                        <span className="text-muted">
                          {" | "}
                          <strong>Due</strong> {formatDue(quiz)}
                          {" | "}
                          {quiz.points} pts
                          {" | "}
                          {quiz.questions?.length || 0} Questions
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      {quiz.published ? (
                        <FaCheckCircle className="text-success" style={{ fontSize: '1.5rem' }} />
                      ) : (
                        <FaBan className="text-muted" style={{ fontSize: '1.5rem' }} />
                      )}
                      
                      {canManageQuizzes && !studentView && (
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="link" 
                            className="text-dark p-0 border-0 bg-transparent"
                            style={{ boxShadow: 'none' }}
                          >
                            <BsThreeDotsVertical className="fs-4" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => router.push(`/Courses/${cid}/Quizzes/${quiz._id}/edit`)}>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(quiz._id)}>
                              Delete
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handlePublishToggle(quiz)}>
                              {quiz.published ? "Unpublish" : "Publish"}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => router.push(`/Courses/${cid}/Quizzes/${quiz._id}`)}>
                              Copy
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {collapsed && (
              <li className="list-group-item text-center text-muted p-3 border-0">
                {displayQuizzes.length} quizzes (collapsed)
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}