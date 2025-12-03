/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });
const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const COURSES_API = `${HTTP_SERVER}/api/courses`;
const QUIZZES_API = `${HTTP_SERVER}/api/quizzes`;
const ATTEMPTS_API = `${HTTP_SERVER}/api/attempts`;

export const findQuizzesForCourse = async (courseId: string) => {
  const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/quizzes`);
  return response.data;
};

export const findQuizById = async (quizId: string) => {
  const response = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

export const createQuizForCourse = async (courseId: string, quiz: any) => {
  const response = await axiosWithCredentials.post(`${COURSES_API}/${courseId}/quizzes`, quiz);
  return response.data;
};

export const updateQuiz = async (quiz: any) => {
  const response = await axiosWithCredentials.put(`${QUIZZES_API}/${quiz._id}`, quiz);
  return response.data;
};

export const deleteQuiz = async (quizId: string) => {
  const response = await axiosWithCredentials.delete(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

export const publishQuiz = async (quizId: string) => {
  const response = await axiosWithCredentials.post(`${QUIZZES_API}/${quizId}/publish`);
  return response.data;
};

export const unpublishQuiz = async (quizId: string) => {
  const response = await axiosWithCredentials.post(`${QUIZZES_API}/${quizId}/unpublish`);
  return response.data;
};

export const addQuestionToQuiz = async (quizId: string, question: any) => {
  const response = await axiosWithCredentials.post(`${QUIZZES_API}/${quizId}/questions`, question);
  return response.data;
};

export const updateQuestion = async (quizId: string, questionId: string, question: any) => {
  const response = await axiosWithCredentials.put(`${QUIZZES_API}/${quizId}/questions/${questionId}`, question);
  return response.data;
};

export const deleteQuestion = async (quizId: string, questionId: string) => {
  const response = await axiosWithCredentials.delete(`${QUIZZES_API}/${quizId}/questions/${questionId}`);
  return response.data;
};

export const startAttempt = async (quizId: string) => {
  const response = await axiosWithCredentials.post(`${QUIZZES_API}/${quizId}/attempts`);
  return response.data;
};

export const submitAttempt = async (attemptId: string, answers: any[]) => {
  const response = await axiosWithCredentials.put(`${ATTEMPTS_API}/${attemptId}/submit`, { answers });
  return response.data;
};

export const getAttempt = async (attemptId: string) => {
  const response = await axiosWithCredentials.get(`${ATTEMPTS_API}/${attemptId}`);
  return response.data;
};

export const getAttemptsForQuiz = async (quizId: string) => {
  const response = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}/attempts/user`);
  return response.data;
};

export const getLatestAttempt = async (quizId: string) => {
  const response = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}/attempts/latest`);
  return response.data;
};