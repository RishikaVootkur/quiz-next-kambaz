"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
};

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    addQuiz: (state, { payload: quiz }) => {
      state.quizzes = [...state.quizzes, quiz] as any;
    },
    deleteQuiz: (state, { payload: quizId }) => {
      state.quizzes = state.quizzes.filter((q: any) => q._id !== quizId);
    },
    updateQuiz: (state, { payload: quiz }) => {
      state.quizzes = state.quizzes.map((q: any) =>
        q._id === quiz._id ? quiz : q
      ) as any;
      if (state.currentQuiz && (state.currentQuiz as any)._id === quiz._id) {
        state.currentQuiz = quiz;
      }
    },
    setCurrentAttempt: (state, action) => {
      state.currentAttempt = action.payload;
    },
  },
});

export const {
  setQuizzes,
  setCurrentQuiz,
  addQuiz,
  deleteQuiz,
  updateQuiz,
  setCurrentAttempt,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;