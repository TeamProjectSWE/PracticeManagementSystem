import client from './client';

const ip = 'http://localhost:4000';
//const address = ip.concat(" ", URL);

//세션 정보
export const getSession = () => client.get('/auth/session');
//개인별 강의정보 받기
export const getUserCourse = (user_code) =>
  client.get(ip + '/testCourseProf/' + user_code);
//강좌별 강의정보 받기
export const getCourse = (course_code) =>
  client.get(ip + '/testCourseProf/' + course_code);
//전체강의보기
export const getAllCourse = () => client.get(ip + '/testCourseProf/all');
//강의개설
export const postCourse = (user_code, courseName, description) =>
  client.post(ip + '/testCourseProf', { user_code, courseName, description });
//강의 내용수정
export const reviseCourse = (course_code, description, user_code) =>
  client.put(ip + '/testCourseProf', { course_code, description, user_code });
//폐강
export const deleteCourse = (course_code, user_code) =>
  client.delete(ip + '/testCourseProf', { data: { course_code, user_code } });
//학생 강의 신청
export const registerCourse = (submitValue, user_code) =>
  client.post(ip + '/testCourseStud/enrolment', { submitValue, user_code });
//강의 룸 정보
export const getRoomInfo = (course_code) =>
  client.get(ip + '/room/' + course_code);
//강의 룸 생성
export const CreateRoom = (course_code, submitValue) =>
  client.post(ip + '/room', { course_code, submitValue });
//강의 룸 닫기
export const closeRoom = (course_code) =>
  client.delete(ip + '/room/' + course_code);
//room 입장
export const InRoom = (course_code, room_code, user_code) =>
  client.post(ip + '/attendance/entrance', {
    course_code,
    room_code,
    user_code,
  });
//room퇴장
export const OutRoom = (course_code, room_code, user_code) =>
  client.post(ip + '/attendance/exit', { course_code, room_code, user_code });
//교수 출석 정보 조회
export const AllRoom = (course_code) =>
  client.get(ip + '/attendance/' + course_code);
//출석 확인 학생
export const StudentAttend = (course_code, user_code) =>
  client.get(ip + '/attendance/student/' + user_code + '/' + course_code);
//출석 수정
export const reviseAttend = (course_code, submitValue) =>
  client.put(ip + '/attendance', { course_code, submitValue });
//전체 과제 조회
export const AllAssign = (course_code) =>
  client.get(ip + '/assignment/' + course_code);
//과제 질문 조회
export const getQuestion = (assignment_code) =>
  client.get(ip + '/question/' + assignment_code);
//개인 질문 조회
export const getmyQuestion = (user_code) =>
  client.get(ip + '/question/my/' + user_code);
//질문생성
export const createQuestion = (
  assignment_code,
  user_code,
  title,
  description,
) =>
  client.post(ip + '/question', {
    assignment_code,
    user_code,
    title,
    description,
  });
//질문수정
export const reviseQuestion = (
  question_code,
  assignment_code,
  title,
  description,
) =>
  client.put(ip + '/question', {
    question_code,
    assignment_code,
    title,
    description,
  });
//질문삭제
export const deleteQuestion = (assignment_code, question_code) =>
  client.delete(ip + '/question', { data: { assignment_code, question_code } });
//질문답변 확인
export const getAnswer = (question_code) =>
  client.get(ip + '/answer/' + question_code);
//질문답변 생성
export const createAnswer = (
  question_code,
  user_code,
  title,
  description,
  code,
) =>
  client.post(ip + '/answer', {
    question_code,
    user_code,
    title,
    description,
    code,
  });
//질문답변 수정
export const reviseAnswer = (question_code, idx, description) =>
  client.put(ip + '/answer', { question_code, idx, description });
//질문답변 삭제
export const deleteAnswer = (question_code, idx) =>
  client.delete(ip + '/answer', { question_code, idx });
