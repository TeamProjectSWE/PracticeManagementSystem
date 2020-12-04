package restful

import (
	"mime/multipart"
)

type (
	ConnectRoom struct {
		RoomCode string `uri:"room_code" validate:"required,lte=10"`
	}
)

// GET API
type (
	APIGetCourseAssignment struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	APIGetAssignment struct {
		AssignmentCode string `uri:"assignment_code" validate:"required,lte=10"`
	}
	APIGetAllQuestion struct {
		AssignmentCode string `uri:"assignment_code" validate:"required,lte=10"`
	}
	APIGetCourse struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	APIGetAllRoom struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	APIGetRoom struct {
		RoomCode string `uri:"room_code" validate:"required,lte=10"`
	}
	APIAvailableRoom struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	APIGetAllAttendance struct {
		RoomCode string `uri:"room_code" validate:"required,lte=10"`
	}
	APIGetAllPackage struct {
	}
	APIGetPackage struct {
		PackageCode string `uri:"package_code" validate:"required,lte=10"`
	}
	APIGetAllProblem struct {
		PackageCode string `uri:"package_code" validate:"required,lte=10"`
	}
	APIGetProblem struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
	}
	APIGetProblemIO struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
		Indexing    string `uri:"indexing" validate:"required"`
	}
	APISignatureProblem struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
		Language    string `uri:"language" validate:"required"`
	}

	APIAssignmentScoring struct {
		Assignment string `uri:"assignment_code" validate:"required,lte=10"`
	}
	APIReadSubmission struct {
		Assignment string `uri:"assignment_code" validate:"required,lte=10"`
		Problem    string `uri:"problem_code" validate:"required,lte=10"`
		User       string `uri:"user_code" validate:"required,lte=10"`
	}
)

// POST API
type (
	APICreateAssignment struct {
		CourseCode  string `uri:"course_code" validate:"required,lte=10"`
		PackageCode string `json:"package"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	APIEnrollCourse struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	AuthPostRegister struct {
		Code     string `form:"code" json:"code" validate:"required"`
		Name     string `form:"name" json:"name" validate:"required"`
		AuthCode string `form:"auth_code" json:"auth_code" validate:"required"`
	}
	APIPostRoom struct {
		CourseCode  string `uri:"course_code" validate:"required,lte=10"`
		Name        string `form:"name" json:"name" validate:"required"`
		Description string `form:"description" json:"description"`
		OpenTime    string `form:"open_time" json:"open_time" validate:"required"`
		CloseTime   string `form:"close_time" json:"close_time" validate:"required,gtefield=OpenTime"`
	}
	APIPostCourse struct {
		Name        string `form:"name" json:"name" validate:"required"`
		Description string `form:"description" json:"description"`
	}
	APISubmissionProblem struct {
		AssignmentCode string                `uri:"assignment_code" validate:"required,lte=10"`
		ProblemCode    string                `uri:"problem_code" validate:"required,lte=10"`
		Language       string                `form:"language" json:"language" validate:"required"`
		Source         *multipart.FileHeader `form:"source" json:"source" validate:"required"`
	}
	APISolveProblem struct {
		ProblemCode string                `uri:"problem_code" validate:"required,lte=10"`
		Language    string                `uri:"language" validate:"required"`
		Source      *multipart.FileHeader `form:"source"`
	}
	APICreatePackage struct {
		Name        string `form:"name" json:"name" validate:"required"`
		Description string `form:"description" json:"description"`
	}
	APIAddProblemToPackage struct {
		PackageCode string   `uri:"package_code" validate:"required,lte=10"`
		Problems    []string `form:"problems" json:"problems"`
	}
	APIAddQuestion struct {
		AssignmentCode string `uri:"assignment_code" validate:"required,lte=10"`
		Title          string `json:"title"`
		Description    string `json:"description"`
	}
	APIAddAnswer struct {
		QuestionCode string `uri:"question_code" validate:"required,lte=10"`
		Description    string `json:"description"`
	}
	APICreateProblem struct {
		Type        string `json:"type" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description" validate:"required"`
		//
		Restriction    *string `json:"restriction"`
		Entry          *string `json:"entry"`
		Parameters     *string `json:"parameters"`
		ParameterNames *string `json:"parameter_names"`
		Return         *string `json:"return"`
	}
	APICreateProblemCase struct {
		Code  string `uri:"problem_code" validate:"required"`
		Cases []Case `json:"cases"`
	}
)

// PUT API
type (
	APIPutProblemTag struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
		Tag         string `uri:"tag" validate:"required"`
	}
	APIEditPackage struct {
		ProblemCode string  `uri:"package_code" validate:"required,lte=10"`
		Name        *string `form:"name" json:"name"`
		Description *string `form:"description" json:"description"`
	}
	APIEditProblem struct {
		Code        string `uri:"problem_code" validate:"required,lte=10"`
		Type        string `json:"type" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description" validate:"required"`
		//
		Restriction *string `json:"restriction"`
		Entry       *string `json:"entry"`
		Parameters  *string `json:"parameters"`
		Return      *string `json:"return"`
	}
	APIEditScore struct {
		Assignment string  `uri:"assignment_code" validate:"required,lte=10"`
		Problem    string  `uri:"problem_code" validate:"required,lte=10"`
		User       string  `uri:"user_code" validate:"required,lte=10"`
		Score      float64 `json:"score" validate:"required"`
	}
)

// DELETE API
type (
	APIDeleteCourse struct {
		CourseCode string `uri:"course_code" validate:"required,lte=10"`
	}
	APIDeleteProblemTagAll struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
	}
	APIDeleteProblemTag struct {
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
		Tag         string `uri:"tag" validate:"required"`
	}
	APIDeletePackage struct {
		ProblemCode string `uri:"package_code" validate:"required,lte=10"`
	}
	APIDeleteProblem struct {
		Code string `uri:"problem_code" validate:"required,lte=10"`
	}
	APIDeletePackageProblem struct {
		PackageCode string `uri:"package_code" validate:"required,lte=10"`
		ProblemCode string `uri:"problem_code" validate:"required,lte=10"`
	}
)

type (
	Case struct {
		Input   string `json:"input" validate:"required"`
		Output  string `json:"output" validate:"required"`
		Visible bool   `json:"visible" validate:"required"`
	}
)
