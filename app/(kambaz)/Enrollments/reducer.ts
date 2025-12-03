/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enrollments: [],
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    setEnrollments: (state, { payload: enrollments }) => {
      state.enrollments = enrollments;
    },
    enrollUser: (state, { payload: { userId, courseId } }) => {
      const newEnrollment = {
        _id: `${Date.now()}`,
        user: userId,
        course: courseId,
      };
      state.enrollments = [...state.enrollments, newEnrollment] as any;
    },
    unenrollUser: (state, { payload: { userId, courseId } }) => {
      state.enrollments = state.enrollments.filter(
        (enrollment: any) =>
          !(enrollment.user === userId && enrollment.course === courseId)
      );
    },
  },
});

export const { setEnrollments, enrollUser, unenrollUser } =
  enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;