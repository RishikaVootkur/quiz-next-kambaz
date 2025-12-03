/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ReactNode, useState } from 'react';
import CourseNavigation from './Navigation';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Breadcrumb from './Breadcrumb';
import 'bootstrap/dist/css/bootstrap.min.css';
import { RootState } from "../../store";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  const { cid } = useParams<{ cid: string }>();
  const { courses } = useSelector((state: RootState) => state.coursesReducer);
  const course = courses.find((course: any) => course._id === cid);

  const [showNav, setShowNav] = useState(true);
  const toggleNav = () => setShowNav((v) => !v);

  return (
    <div id="wd-courses">
      <Breadcrumb course={course} onToggle={toggleNav} />
      <hr />
      <div className="d-flex">
        {showNav && (
          <div>
            <CourseNavigation cid={cid} />
          </div>
        )}
        <div className="flex-fill">{children}</div>
      </div>
    </div>
  );
}