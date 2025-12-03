/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { RootState } from "../store";
import * as coursesClient from "../Courses/client";
import * as userClient from "../Account/client";
import * as enrollmentsClient from "../Enrollments/client";
import { setEnrollments } from "../Enrollments/reducer";
import Link from "next/link";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { Button, FormControl } from "react-bootstrap";
import { useState, useEffect } from "react"; 
import { useDispatch, useSelector } from "react-redux";
import { addNewCourse, deleteCourse, updateCourse, setCourses } from "../Courses/reducer";
import { enrollUser, unenrollUser } from "../Enrollments/reducer";

export default function Dashboard() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentsReducer);
  const { courses } = useSelector((state: any) => state.coursesReducer);
  const dispatch = useDispatch();
  
  const [course, setCourse] = useState<any>({
    _id: "0", name: "New Course", number: "New Number", 
    startDate: "2023-09-10", endDate: "2023-12-15",
    image: "/images/reactjs.jpg", description: "New Description"
  });

  const [showAllCourses, setShowAllCourses] = useState(false);
  const isFaculty = currentUser?.role === "FACULTY";

  const findCoursesForUser = async () => {
    try {
      const courses = await userClient.findCoursesForUser(currentUser._id);
      dispatch(setCourses(courses));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllCoursesWithEnrollment = async () => {
    try {
      const allCourses = await coursesClient.fetchAllCourses();
      const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
      
      const coursesWithEnrollment = allCourses.map((course: any) => {
        if (enrolledCourses.find((c: any) => c._id === course._id)) {
          return { ...course, enrolled: true };
        } else {
          return course;
        }
      });
      dispatch(setCourses(coursesWithEnrollment));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollments = await enrollmentsClient.fetchAllEnrollments();
        dispatch(setEnrollments(enrollments));
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };
    fetchEnrollments();
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;
    
    if (showAllCourses) {
      fetchAllCoursesWithEnrollment();  
    } else {
      findCoursesForUser(); 
    }
  }, [currentUser, showAllCourses]);

  const onAddNewCourse = async () => {
    try {
      const newCourse = await userClient.createCourse(course);
      dispatch(setCourses([...courses, newCourse]));
      setCourse({
        _id: "0", name: "New Course", number: "New Number", 
        startDate: "2023-09-10", endDate: "2023-12-15",
        image: "/images/reactjs.jpg", description: "New Description"
      });
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const onDeleteCourse = async (courseId: string) => {
    try {
      await coursesClient.deleteCourse(courseId);
      dispatch(setCourses(courses.filter((c: any) => c._id !== courseId))); 
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const onUpdateCourse = async () => {
    try {
      await coursesClient.updateCourse(course);
      dispatch(setCourses(courses.map((courseItem: any) => { 
        if (courseItem._id === course._id) { return course; }
        else { return courseItem; }
      })));
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const isEnrolled = (courseId: string) => {
    if (!currentUser) return false;
    return enrollments.some(
      (enrollment: any) =>
        enrollment.user === currentUser._id &&
        enrollment.course === courseId
    );
  };

  const enrolledCourses = currentUser 
    ? courses.filter((course: any) => isEnrolled(course._id))
    : [];

  const displayedCourses = showAllCourses ? courses : enrolledCourses;

  const handleEnrollment = async (courseId: string) => {
    if (!currentUser) return;
    
    try {
      if (isEnrolled(courseId)) {
        await userClient.unenrollFromCourse(currentUser._id, courseId);
        dispatch(unenrollUser({ userId: currentUser._id, courseId }));
      } else {
        await userClient.enrollIntoCourse(currentUser._id, courseId);
        dispatch(enrollUser({ userId: currentUser._id, courseId }));
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    }
  };

  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1>
      
      {isFaculty && (
        <>
          <h5>New Course 
            <button className="btn btn-primary float-end"
              id="wd-add-new-course-click"
              onClick={onAddNewCourse}>
              Add
            </button>
            <button className="btn btn-warning float-end me-2"
              id="wd-update-course-click"
              onClick={onUpdateCourse}>
              Update
            </button>  
          </h5>
          <br/>
          <FormControl value={course.name} className="mb-2"
            onChange={(e) => setCourse({...course, name: e.target.value})}/>
          <FormControl value={course.description} className="mb-2"
            onChange={(e) => setCourse({...course, description: e.target.value})}/>
          <hr />
        </>
      )}
      
      <h2 id="wd-dashboard-published">
        Published Courses ({displayedCourses.length})
        <Button 
          variant="primary" 
          className="float-end"
          onClick={() => setShowAllCourses(!showAllCourses)}
          id="wd-enrollments-btn"
        >
          {showAllCourses ? "My Courses" : "Enrollments"}
        </Button>
      </h2>
      <hr />
      
      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {displayedCourses.map((course: any) => (
            <Col
              key={course._id}
              className="wd-dashboard-course"
              style={{ width: "300px" }}>
              <Card>
                <Link
                  href={`/Courses/${course._id}/Home`}
                  className="wd-dashboard-course-link text-decoration-none text-dark">
                  <Card.Img
                    src={course.image}
                    variant="top"
                    width="100%"
                    height={160}
                  />
                  <Card.Body className="card-body">
                    <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
                      {course.name}
                    </Card.Title>
                    <Card.Text
                      className="wd-dashboard-course-description overflow-hidden"
                      style={{ height: "100px" }}>
                      {course.description}
                    </Card.Text>
                    <Button variant="primary">Go</Button>
                    
                    {showAllCourses && (
                      <Button 
                        onClick={(event) => {
                          event.preventDefault();
                          handleEnrollment(course._id);
                        }}
                        className={`float-end ${isEnrolled(course._id) ? 'btn-danger' : 'btn-success'}`}
                        id="wd-enrollment-btn"
                      >
                        {isEnrolled(course._id) ? 'Unenroll' : 'Enroll'}
                      </Button>
                    )}
                    
                    {isFaculty && !showAllCourses && (
                      <>
                        <Button onClick={(event) => {
                          event.preventDefault();
                          onDeleteCourse(course._id);
                        }} className="btn btn-danger float-end"
                          id="wd-delete-course-click">
                          Delete
                        </Button>
                        <button id="wd-edit-course-click"
                          onClick={(event) => {
                            event.preventDefault();
                            setCourse(course);
                          }}
                          className="btn btn-warning me-2 float-end">
                          Edit
                        </button>
                      </>
                    )}
                  </Card.Body>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}