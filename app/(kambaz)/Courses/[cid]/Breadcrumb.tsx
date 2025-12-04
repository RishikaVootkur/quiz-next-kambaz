'use client';
import { usePathname, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaAlignJustify } from 'react-icons/fa';

export default function Breadcrumb({
  course,
  onToggle,
}: {
  course?: { name: string };
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const [pageName, setPageName] = useState("Home");

  useEffect(() => {
    const getPageName = async () => {
      let name = "Home";
      
      if (pathname.includes('/Quizzes/') && pathname.includes('/edit')) {
        // For quiz edit page - just show "Edit Quiz"
        name = "Quizzes > Edit Quiz";
      } else if (pathname.includes('/Quizzes/') && pathname.includes('/preview')) {
        name = "Quizzes > Preview";
      } else if (pathname.includes('/Quizzes/') && pathname.includes('/take')) {
        name = "Quizzes > Take Quiz";
      } else if (pathname.includes('/Quizzes/') && !pathname.includes('/edit')) {
        name = "Quizzes > Quiz Details";
      } else if (pathname.includes('/Quizzes')) {
        name = "Quizzes";
      } else if (pathname.includes('/Modules')) {
        name = "Modules";
      } else if (pathname.includes('/Assignments/') && pathname.includes('/Editor')) {
        name = "Assignments > Assignment Editor";
      } else if (pathname.includes('/Assignments')) {
        name = "Assignments";
      } else if (pathname.includes('/Grades')) {
        name = "Grades";
      } else if (pathname.includes('/People')) {
        name = "People";
      } else if (pathname.includes('/Piazza')) {
        name = "Piazza";
      } else if (pathname.includes('/Zoom')) {
        name = "Zoom";
      }
      
      setPageName(name);
    };
    
    getPageName();
  }, [pathname, params]);

  return (
    <h2 className="text-danger">
      <FaAlignJustify
        className="me-3 fs-4 mb-1"
        role="button"
        aria-label="Toggle course navigation"
        onClick={onToggle}
      />
      {course?.name} &gt; {pageName}
    </h2>
  );
}