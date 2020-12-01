import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './common';
import { Minimal as MinimalLayout, Default as DefaultLayout } from './layouts';

import {
  Home as HomePage,
  Packages as PackagesPage,
  Problems as ProblemsPage,
  NotFoundCover as NotFoundCoverPage,
  Solving as SolvingPage
} from './pages';
import MainRoomPage from "./pages/MainRoomPage";
import LoginPage from "./pages/LoginPage";
import PostListPage from "./pages/PostListPage";
import QpListPage from "./pages/QpListPage";
import ReviseCoursePage from "./pages/ReviseCoursePage";
import AtttendancePage from "./pages/AttendancePage";
import RegisterPage from "./pages/RegisterPage";
import DeleteCoursePage from "./pages/DeleteCoursePage";
import RegisterCoursePage from "./pages/RegisterCoursePage";
import OpenCoursePage from "./pages/OpenCoursePage";
import QpPage from "./pages/QpPage";
import QpreadPage from "./pages/QpreadPage";
import QpwritePage from "./pages/QpwritePage";
import MainPage from "./pages/MainPage";
import SelectQuestionPage from "./pages/selectQuestionPage";
import AnswerPage from "./pages/AnswerPage";
import TablePage from "./pages/TablePage";
import ReviseQuestion from "./pages/ReviseQuestion";

const Routes = () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      {/* ---------------------------------------------- */}
      {/* Home */}
      <RouteWithLayout
        component={HomePage}
        exact
        layout={DefaultLayout}
        path="/home"
      />
      {/* Packages */}
      <RouteWithLayout
        component={PackagesPage}
        exact
        layout={DefaultLayout}
        path="/packages"
      />
      {/* Problems - 모든 문제 목록 */}
      <RouteWithLayout
        component={ProblemsPage}
        exact
        layout={DefaultLayout}
        path="/problems"
      />
      {/* Problems - 특정 패키지의 문제 목록 */}
      <RouteWithLayout
        component={ProblemsPage}
        exact
        layout={DefaultLayout}
        path="/problems/:packageCode"
      />
      {/* solving */}
      <RouteWithLayout
        component={SolvingPage}
        exact
        layout={DefaultLayout}
        path="/solving"
      />

      {/* ---------------------------------------------- */}
      {/* 홈 */}
      <RouteWithLayout
        component={PostListPage}
        exact
        layout={DefaultLayout}
        path="/@:username"
      />
      {/* 로그인 */}
      <RouteWithLayout
        component={LoginPage}
        exact
        layout={DefaultLayout}
        path="/login"
      />
      {/* 회원가입 */}
      <RouteWithLayout
        component={RegisterPage}
        exact
        layout={DefaultLayout}
        path="/register"
      />
      {/* 출석수정 및 확인 */}
      <RouteWithLayout
        component={AtttendancePage}
        exact
        layout={DefaultLayout}
        path="/attendance/:course_code/:user_code/:auth"
      />
      {/* 강의개설 */}
      <RouteWithLayout
        component={OpenCoursePage}
        exact
        layout={DefaultLayout}
        path="/opencourse/:user_code"
      />
      {/* 강의신청 */}
      <RouteWithLayout
        component={RegisterCoursePage}
        exact
        layout={DefaultLayout}
        path="/registercourse/:user_code"
      />
      {/* 강의폐강 */}
      <RouteWithLayout
        component={DeleteCoursePage}
        exact
        layout={DefaultLayout}
        path="/deletecourse/:course_code/:user_code"
      />
      {/* 강의정보 수정 */}
      <RouteWithLayout
        component={ReviseCoursePage}
        exact
        layout={DefaultLayout}
        path="/revisecourse/:course_code/:user_code"
      />
      {/* 강의실 */}
      <RouteWithLayout
        component={MainRoomPage}
        exact
        layout={DefaultLayout}
        path="/mainroom"
      />
      {/* 질문목록 */}
      <RouteWithLayout
        component={QpListPage}
        exact
        layout={DefaultLayout}
        path="/Qplist/:course_code/:user_code/:code"
      />
      {/* 질문할 문제 선택페이지 */}
      <RouteWithLayout
        component={QpPage}
        exact
        layout={DefaultLayout}
        path="/QuestionProblem/:course_code/:user_code/:auth"
      />
      {/* 질문작성 */}
      <RouteWithLayout
        component={QpwritePage}
        exact
        layout={DefaultLayout}
        path="/Qpwrite/:course_code/:user_code/:code/:auth"
      />
      {/* 질문 작성 페이지 */}
      <RouteWithLayout
        component={QpreadPage}
        exact
        layout={DefaultLayout}
        path="/Qpread/:course_code/:user_code/:code"
      />
      {/* 질문 수정 페이지 */}
      <RouteWithLayout
        component={ReviseQuestion}
        exact
        layout={DefaultLayout}
        path="/reviseQuestion/:questioncode/:user_code/:Assigncode"
      />
      {/* 질문 선택 페이지 */}
      <RouteWithLayout
        component={SelectQuestionPage}
        exact
        layout={DefaultLayout}
        path="/select/:course_code/:user_code/:code/:auth"
      />
      {/* 답변작성 페이지 */}
      <RouteWithLayout
        component={AnswerPage}
        exact
        layout={DefaultLayout}
        path="/answer/:questioncode/:user_code/:Assigncode"
      />
      {/* room 개설 */}
      <RouteWithLayout
        component={TablePage}
        exact
        layout={DefaultLayout}
        path="/roompage1/:course_code/:user_code/:auth_code"
      />
      {/* room입장후 화면 */}
      <RouteWithLayout
        component={MainPage}
        exact
        layout={DefaultLayout}
        path="/roompage2/:course_code/:room_code/:user_code"
      />

      <RouteWithLayout
        component={NotFoundCoverPage}
        exact
        layout={MinimalLayout}
        path="/not-found-cover"
      />
      <Redirect to="/not-found-cover" status="404" />
    </Switch>
  );
};

export default Routes;
