"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./styles.css";

export default function CourseNavigation({ cid }: { cid: string }) {
  const pathname = usePathname();
  const links = [
    "Home",
    "Modules",
    "Piazza",
    "Zoom",
    "Assignments",
    "Quizzes",
    "Grades",
    "People"
  ];

  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((link) => {
        const href = link === "People" 
          ? `/Courses/${cid}/People`      // FIXED - Removed /Kambaz
          : `/Courses/${cid}/${link}`;     // FIXED - Removed /Kambaz
        const isActive = pathname.includes(link);
        
        return (
          <Link
            key={link}
            href={href}
            id={`wd-course-${link.toLowerCase()}-link`}
            className={`list-group-item text-danger border-0 ${
              isActive ? "wd-active" : ""
            }`}
          >
            {link}
          </Link>
        );
      })}
    </div>
  );
}