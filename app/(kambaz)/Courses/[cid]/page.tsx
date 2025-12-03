"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store";


export default function CoursePage(
  { params }: { params: { cid: string } }
) {
  const { cid } = params;
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  const { enrollments } = useSelector((state: RootState) => state.enrollmentsReducer);

  const isEnrolled = enrollments.some(
    (enrollment: any) =>
      enrollment.user === currentUser?._id &&
      enrollment.course === cid
  );

  if (!isEnrolled && currentUser) {
    redirect("/Dashboard");
  }

  redirect(`/Courses/${cid}/Home`);
}