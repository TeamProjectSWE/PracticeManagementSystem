package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/TeamProjectWSE/PracticeManagementSystem/server/coding"
	"github.com/TeamProjectWSE/PracticeManagementSystem/server/restful"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"io/ioutil"
	"log"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"
)

const (
	MYSQLErrorPK = 1062
	MYSQLErrorFK = 1452
)

type Authority struct {
	Code  string `json:"code,omitempty"`
	Name  string `json:"name,omitempty"`
	Level int    `json:"level,omitempty"`
}
type User struct {
	Code string `json:"code,omitempty"`
	Name string `json:"name,omitempty"`
}
type Session struct {
	User   User                   `json:"user,omitempty"`
	Auth   Authority              `json:"auth,omitempty"`
	Extras map[string]interface{} `json:"extras,omitempty"`
}

const (
	GOOGLEAPI_USERINFO              = "https://www.googleapis.com/oauth2/v3/userinfo"
	GOOGLEAPISCOPE_USERINFO_EMAIL   = "https://www.googleapis.com/auth/userinfo.email"
	GOOGLEAPISCOPE_USERINFO_PROFILE = "https://www.googleapis.com/auth/userinfo.profile"
)

const ServerUrl = "http://ddiggo.iptime.org"

var (
	session      map[string]*Session
	wsconn       = make(map[string][]*websocket.Conn)
	config       gjson.Result
	db           *sql.DB
	engine       *gin.Engine
	oauth2Google *oauth2.Config
	logger       *log.Logger
	wsUpgrader   = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

func ready() (err error) {
	if veg, ok := binding.Validator.Engine().(*validator.Validate); ok {
		veg.SetTagName("validate")
	}
	//
	bts, err := ioutil.ReadFile("./.local.json")
	if err != nil {
		return err
	}
	config = gjson.ParseBytes(bts)
	//
	db, err = sql.Open(
		"mysql",
		(&mysql.Config{
			User:   "lacolico",
			Passwd: "1q2w3e4r!",
			Net:    "tcp",
			Addr:   "sunshine.ceh2bnjpp9j5.ap-northeast-2.rds.amazonaws.com:3306",
			DBName: "coditnator",
			Params: map[string]string{
				"parseTime": "true",
			},
			AllowNativePasswords: true,
		}).FormatDSN(),
	)
	if err != nil {
		return err
	}
	oauth2Google = &oauth2.Config{
		ClientID:     config.Get("google.client_id").String(),
		ClientSecret: config.Get("google.client_secret").String(),
		Endpoint:     google.Endpoint,
		RedirectURL:  ServerUrl + "/auth/login/callback",
		Scopes:       []string{GOOGLEAPISCOPE_USERINFO_EMAIL, GOOGLEAPISCOPE_USERINFO_PROFILE},
	}
	engine = gin.Default()
	session = make(map[string]*Session)
	logger = log.New(os.Stdout, "[coditnator] ", log.LstdFlags)
	//
	//
	coding.SetupLang(coding.PYTHON, coding.MustPython(config.Get("coding.python").String()))
	return nil
}
func setup() {
	engine.Use(cors.New(cors.Config{
		//AllowOrigins:           []string{"http://localhost:3000"},
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowMethods:           []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"},
		AllowHeaders:           []string{"Origin", "Content-Length", "Content-Type", "Cookie", "Set-Cookie"},
		AllowCredentials:       true,
		ExposeHeaders:          []string{"Content-Length"},
		MaxAge:                 12 * time.Hour,
		AllowBrowserExtensions: true,
		AllowWebSockets:        true,
		AllowFiles:             true,
	}))
	engine.GET("/", func(c *gin.Context) { c.Redirect(http.StatusPermanentRedirect, "/static/index.html") })
	engine.GET("/favicon.ico", func(c *gin.Context) { c.Redirect(http.StatusPermanentRedirect, "/static/favicon.ico") })
	engine.Group("/static").Use(func(c *gin.Context) {
		if cookiestate, err := c.Cookie("state"); err != nil {
			noCache(c)
			c.Redirect(http.StatusPermanentRedirect, "/auth/login")
			return
		} else {
			if _, ok := session[cookiestate]; !ok {
				noCache(c)
				c.Redirect(http.StatusPermanentRedirect, "/auth/login")
				return
			}
		}
		c.Next()
		if c.Writer.Status() == http.StatusNotFound {
			c.File("./root/index.html")
		}
	}).Static("/", "./root")
	// 로그인
	// TODO POST /auth/register
	//
	apisvr := engine.Group("/api", func(c *gin.Context) {
	})
	engine.POST("/auth/register", checkNoSession(), func(c *gin.Context) {
		var (
			param restful.AuthPostRegister
			err   error
		)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if _, err = db.Exec(`INSERT INTO user(code, name, authority_code) VALUES (?,?,?)`, param.Code, param.Name, param.AuthCode); err != nil {
			mysqlError(err,
				func(err *mysql.MySQLError) {
					switch err.Number {
					case MYSQLErrorPK:
						c.JSON(http.StatusOK, restful.Fail("exist code", nil))
					case MYSQLErrorFK:
						c.JSON(http.StatusOK, restful.Fail("not exist authority", nil))
					default:
						panic(err)
					}
				}, func() {
					panic(err)
				})
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	engine.GET("/auth/login", checkNoSession(), func(c *gin.Context) {
		state := uuid.New().String()
		c.Redirect(http.StatusTemporaryRedirect, oauth2Google.AuthCodeURL(state))
	})
	engine.GET("/auth/login/callback", checkNoSession(), func(c *gin.Context) {
		var (
			state = c.Query("state")
			code  = c.Query("code")
		)
		token, err := oauth2Google.Exchange(context.Background(), code)
		if err != nil {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		userinfo, err := oauth2Google.Client(context.Background(), token).Get(GOOGLEAPI_USERINFO)
		if err != nil {
			panic(err)
		}
		defer userinfo.Body.Close()
		userinfoBytes, err := ioutil.ReadAll(userinfo.Body)
		if err != nil {
			panic(err)
		}
		email := gjson.ParseBytes(userinfoBytes).Get("email").String()
		mksess := &Session{
			User:   User{},
			Auth:   Authority{},
			Extras: make(map[string]interface{}),
		}
		err = db.QueryRow("SELECT u.code, u.name, a.code, a.name, a.level FROM `user` u INNER JOIN login l on u.code = l.target_user INNER JOIN authority a on u.authority_code = a.code WHERE l.identifier = ? AND l.hash_or_extern = 'google'", email).Scan(&mksess.User.Code, &mksess.User.Name, &mksess.Auth.Code, &mksess.Auth.Name, &mksess.Auth.Level)
		if err != nil {
			// 로그인 실패
			fmt.Println(err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		session[state] = mksess
		c.SetCookie("state", state, int(1*time.Hour/time.Second), "", "", false, false)
		c.Redirect(http.StatusPermanentRedirect, "/")
	})
	engine.GET("/auth/logout", checkSession(), func(c *gin.Context) {
		delete(session, c.MustGet("state").(string))
		noCache(c)
		c.SetCookie("state", "", 0, "", "", false, false)
		c.Redirect(http.StatusPermanentRedirect, "/auth/login")
	})
	engine.GET("/auth/session", setupSession(), func(c *gin.Context) {
		sess, exist := c.Get("session")
		if !exist {
			c.JSON(http.StatusOK, restful.Fail("not login", nil))
			return
		}
		c.JSON(http.StatusOK, restful.Success(sess))
	})
	//
	engine.GET("/connect/:room_code", checkSession(), func(c *gin.Context) {
		sessUserCode := c.MustGet("session").(*Session).User.Code
		var (
			param restful.ConnectRoom
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			openAt  sql.NullTime
			closeAt sql.NullTime
		)
		if err = db.QueryRow(`SELECT open_time, close_time FROM course_room WHERE code=?`, param.RoomCode).Scan(&openAt, &closeAt); err != nil {
			c.JSON(http.StatusOK, restful.Fail("db fail", err))
			return
		}
		if !openAt.Valid || !closeAt.Valid {
			c.JSON(http.StatusOK, restful.Fail("time error", err))
			return
		}
		//
		curr := time.Now()
		if !(curr.After(openAt.Time) && curr.Before(closeAt.Time)) {
			c.JSON(http.StatusOK, restful.Fail("not opened", err))
			return
		}
		conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("fail to connect", err))
			return
		}
		//
		if _, ok := wsconn[param.RoomCode]; !ok {
			fmt.Println("timer setup", param.RoomCode)
			timer := time.NewTimer(closeAt.Time.Sub(time.Now()) + time.Second)
			go func() {
				<-timer.C
				fmt.Println("timer active", param.RoomCode)
				for _, w := range wsconn[param.RoomCode] {
					w.Close()
				}
				delete(wsconn, param.RoomCode)
			}()
			wsconn[param.RoomCode] = []*websocket.Conn{conn}
		} else {
			wsconn[param.RoomCode] = append(wsconn[param.RoomCode], conn)
		}
		go func() {
			entered := time.Now()
			for {
				t, msg, err := conn.ReadMessage()
				if err != nil {
					fmt.Println("ws error :", err)
					closed := time.Now()
					db.Exec(`INSERT INTO attendance VALUES(?, ?, ?, ?, ?)`, sessUserCode, "", param.RoomCode, entered, closed)
					break
				}
				fmt.Println(t, msg)
				for _, w := range wsconn[param.RoomCode] {
					if w != conn {
						w.WriteMessage(t, msg)
					}
				}
			}
			fmt.Println("broadcast end", param.RoomCode)
		}()
	})
	// 세션정보
	// 새로운 예시
	// course계통 api
	//engine.POST("/api/course",
	//	levelCondition(func(level int) bool { return level >= 1 }),
	//	func(c *gin.Context) {
	//		var (
	//			params = c.PostForm("params")
	//		)
	//	})
	//
	apisvr.GET("/course", func(c *gin.Context) {
		rows, err := db.Query("SELECT c.code, c.name, c.description, u.code, u.name FROM `course` c INNER JOIN `user` u ON c.user_code = u.code")
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		var result = []byte("[]")

		for rows.Next() {
			var (
				code           string
				name           string
				description    string
				instructorCode string
				instructorName string
				tmp            = []byte("{}")
			)
			err := rows.Scan(&code, &name, &description, &instructorCode, &instructorName)
			if err != nil {
				panic(err)
			}
			tmp, _ = sjson.SetBytes(tmp, "code", code)
			tmp, _ = sjson.SetBytes(tmp, "name", name)
			tmp, _ = sjson.SetBytes(tmp, "description", description)
			tmp, _ = sjson.SetBytes(tmp, "instructor.code", instructorCode)
			tmp, _ = sjson.SetBytes(tmp, "instructor.name", instructorName)
			result, _ = sjson.SetRawBytes(result, "-1", tmp)
		}
		c.JSON(
			http.StatusOK,
			restful.Success(json.RawMessage(result)),
		)
	})
	apisvr.GET("/my-course", checkSession(), func(c *gin.Context) {
		sess := c.MustGet("session").(*Session)
		var (
			rows *sql.Rows
			err  error
		)
		if sess.Auth.Level >= 2 {
			rows, err = db.Query("SELECT c.code, c.name, c.description, u.code, u.name FROM `course` c INNER JOIN `user` u ON c.user_code = u.code WHERE c.user_code=?", sess.User.Code)
		} else {
			rows, err = db.Query("SELECT c.code, c.name, c.description, u.code, u.name FROM course_enrolment ce INNER JOIN course c on ce.course_code = c.code INNER JOIN `user` u ON c.user_code = u.code  WHERE ce.user_code=?", sess.User.Code)
		}
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		var result = []byte("[]")

		for rows.Next() {
			var (
				code           string
				name           string
				description    string
				instructorCode string
				instructorName string
				tmp            = []byte("{}")
			)
			err := rows.Scan(&code, &name, &description, &instructorCode, &instructorName)
			if err != nil {
				panic(err)
			}
			tmp, _ = sjson.SetBytes(tmp, "code", code)
			tmp, _ = sjson.SetBytes(tmp, "name", name)
			tmp, _ = sjson.SetBytes(tmp, "description", description)
			tmp, _ = sjson.SetBytes(tmp, "instructor.code", instructorCode)
			tmp, _ = sjson.SetBytes(tmp, "instructor.name", instructorName)
			result, _ = sjson.SetRawBytes(result, "-1", tmp)
		}
		c.JSON(
			http.StatusOK,
			restful.Success(json.RawMessage(result)),
		)
	})
	apisvr.GET("/course/:course_code", func(c *gin.Context) {
		var (
			params restful.APIGetCourse
			err    error
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			code           string
			name           string
			description    string
			instructorCode string
			instructorName string
			result         = "{}"
		)
		err = db.QueryRow(
			"SELECT c.code, c.name, c.description, u.code, u.name FROM `course` c INNER JOIN `user` u ON c.user_code = u.code WHERE c.code = ?",
			params.CourseCode,
		).Scan(&code, &name, &description, &instructorCode, &instructorName)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				restful.Fail("no row", nil)
			} else {
				mysqlError(err,
					func(err *mysql.MySQLError) {
						panic(err)
					},
					func() {
						panic(err)
					},
				)
			}
			return
		}
		result, _ = sjson.Set(result, "code", code)
		result, _ = sjson.Set(result, "name", name)
		result, _ = sjson.Set(result, "description", description)
		result, _ = sjson.Set(result, "instructor.code", instructorCode)
		result, _ = sjson.Set(result, "instructor.name", instructorName)
		c.Set("course", result)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(c.GetString("course"))))
	})
	apisvr.POST("/course", levelAboveEqual(2), func(c *gin.Context) {
		var (
			params  restful.APIPostCourse
			session = c.MustGet("session").(*Session)
			err     error
		)
		var (
			nextCodeNumber int
			nextCode       string
		)
		err = c.ShouldBind(&params)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("rule violation", err))
			return
		}
		if err = db.QueryRow(`
		SELECT max(CAST(TRIM(LEADING 'COUR' FROM code) AS INTEGER )) + 1 FROM course`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("COUR%06d", nextCodeNumber)
		_, err = db.Exec(
			`INSERT INTO course(code, name, description, user_code) VALUES (?, ?, ?, ?)`,
			nextCode,
			params.Name,
			params.Description,
			session.User.Code,
		)
		if err != nil {
			mysqlError(err,
				func(err *mysql.MySQLError) {
					switch err.Number {
					case MYSQLErrorFK:
						c.JSON(http.StatusOK, restful.Fail("user not exist", nil))
					case MYSQLErrorPK:
						c.JSON(http.StatusOK, restful.Fail("primary key fail", nil))
					default:
						log.Println("unknown")
						c.JSON(http.StatusOK, restful.Fail("constraint fail", nil))
					}
				},
				func() {
					panic(err)
				},
			)
			return
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.DELETE("/course/:course_code", func(c *gin.Context) {
		var (
			params restful.APIDeleteCourse
			err    error
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`DELETE FROM course WHERE code=?`, params.CourseCode)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.POST("/course/:course_code/enroll", checkSession(), func(c *gin.Context) {
		sess := c.MustGet("session").(*Session)
		var (
			params restful.APIEnrollCourse
			err    error
		)

		c.ShouldBindUri(&params)
		if err = c.ShouldBind(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`INSERT INTO course_enrolment VALUES (?, ?)`, params.CourseCode, sess.User.Code)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("rule violation", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/course/:course_code/assignment", func(c *gin.Context) {
		var (
			params restful.APIGetCourseAssignment
			err    error
			rows   *sql.Rows
			result = "[]"
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		rows, err = db.Query(`SELECT a.code, a.package_code, a.description, a.path FROM course_assignment a WHERE a.course_code=?`, params.CourseCode)
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		for rows.Next() {
			var (
				tmp   = "{}"
				acode string
				pcode string
				desc  string
				title string
			)
			if err = rows.Scan(&acode, &pcode, &desc, &title); err != nil {
				c.JSON(http.StatusOK, restful.Fail("db fail", err))
				return
			}
			tmp, _ = sjson.Set(tmp, "code", acode)
			tmp, _ = sjson.Set(tmp, "package", pcode)
			tmp, _ = sjson.Set(tmp, "course", params.CourseCode)
			tmp, _ = sjson.Set(tmp, "description", desc)
			tmp, _ = sjson.Set(tmp, "title", title)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.POST("/course/:course_code/assignment", func(c *gin.Context) {
		var (
			params restful.APICreateAssignment
			err    error
		)
		var (
			nextCodeNumber int
			nextCode       string
		)
		c.ShouldBindUri(&params)
		if err = c.ShouldBind(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if err = db.QueryRow(`
		SELECT max(CAST(TRIM(LEADING 'ASSI' FROM code) AS INTEGER )) + 1 FROM course_assignment`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("ASSI%06d", nextCodeNumber)
		_, err = db.Exec(`INSERT INTO course_assignment VALUES (?, ?, ?, ?, ?)`, nextCode, params.CourseCode, params.PackageCode, params.Description, params.Title)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.GET("/course/:course_code/room", func(c *gin.Context) {
		var (
			result = "[]"
			params restful.APIGetAllRoom
			err    error
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		rows, err := db.Query(`
SELECT r.code, r.name, r.description, r.open_time, r.close_time
FROM course_room r
         INNER JOIN course c on r.course_code = c.code
WHERE c.code = ?`,
			params.CourseCode,
		)
		if err != nil {
			mysqlError(err,
				func(err *mysql.MySQLError) {
					panic(err)
				},
				func() {
					panic(err)
				})
			return
		}
		defer rows.Close()
		for rows.Next() {
			var (
				rcod      string
				name      string
				desc      string
				openTime  sql.NullTime
				closeTime sql.NullTime
				tmp       = "{}"
			)
			err = rows.Scan(&rcod, &name, &desc, &openTime, &closeTime)
			if err != nil {
				panic(err)
			}
			tmp, _ = sjson.Set(tmp, "code", rcod)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", desc)
			if openTime.Valid {
				tmp, _ = sjson.Set(tmp, "open_time", openTime.Time.Format(time.RFC3339))
			}
			if closeTime.Valid {
				tmp, _ = sjson.Set(tmp, "close_time", closeTime.Time.Format(time.RFC3339))
			}
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.POST("/course/:course_code/room", levelAboveEqual(2), func(c *gin.Context) {
		var (
			param restful.APIPostRoom
			err   error
		)
		var (
			nextCodeNumber int
			nextCode       string
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if err = db.QueryRow(`
		SELECT max(CAST(TRIM(LEADING 'ROOM' FROM code) AS INTEGER )) + 1 FROM course_room`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("ROOM%06d", nextCodeNumber)
		open, err := time.Parse(time.RFC3339, param.OpenTime)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid time open parameter", err))
			return
		}
		close, err := time.Parse(time.RFC3339, param.CloseTime)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid time close parameter", err))
			return
		}
		_, err = db.Exec(
			`INSERT INTO course_room(code, course_code, name, description, open_time, close_time)
VALUES(?, ?, ?, ?, ?, ?)`,
			nextCode,
			param.CourseCode,
			param.Name,
			param.Description,
			open,
			close,
		)
		if err != nil {
			mysqlError(err,
				func(err *mysql.MySQLError) {
					switch err.Number {
					case MYSQLErrorPK:
						c.JSON(http.StatusOK, restful.Fail("room code conflict", nil))
					case MYSQLErrorFK:
						c.JSON(http.StatusOK, restful.Fail("not exist user or course", nil))

					}
				},
				func() {
					panic(err)
				})
			return
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.GET("/room/:room_code", func(c *gin.Context) {
		current := time.Now()
		var (
			params restful.APIGetRoom
			err    error
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			name           string
			description    string
			open           sql.NullTime
			close          sql.NullTime
			instructorCode string
			instructorName string
			result         = "{}"
		)
		err = db.QueryRow(
			"SELECT r.name, r.description, r.open_time, r.close_time, u.code, u.name FROM `room` r INNER JOIN `course` c ON r.course_code = c.code INNER JOIN `user` u ON c.user_code = u.code WHERE r.code=?",
			params.RoomCode,
		).Scan(&name, &description, &open, &close, &instructorCode, &instructorName)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusOK, restful.Fail("no row", nil))
			} else {
				panic(err)
			}
			return
		}
		result, _ = sjson.Set(result, "code", params.RoomCode)
		result, _ = sjson.Set(result, "name", name)
		result, _ = sjson.Set(result, "description", description)
		if open.Valid {
			result, _ = sjson.Set(result, "open_time", open.Time.Format(time.RFC3339))
		}
		if close.Valid {
			result, _ = sjson.Set(result, "close_time", close.Time.Format(time.RFC3339))
		}
		var (
			openAfterCurr   = false
			closeBeforeCurr = false
		)
		if open.Valid && current.After(open.Time) {
			openAfterCurr = true
		}
		if close.Valid && current.Before(close.Time) {
			closeBeforeCurr = true
		}
		result, _ = sjson.Set(result, "available", openAfterCurr && closeBeforeCurr)
		result, _ = sjson.Set(result, "instructor.code", instructorCode)
		result, _ = sjson.Set(result, "instructor.name", instructorName)
		c.Set("room", result)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(c.GetString("room"))))
	})
	apisvr.GET("/room/:room_code/attendance", func(c *gin.Context) {
		var (
			param  restful.APIGetAllAttendance
			result = "[]"
			err    error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			openT  time.Time
			closeT time.Time
			totalD time.Duration
		)
		if err = db.QueryRow(`SELECT r.open_time, r.close_time FROM course_room r  WHERE r.code=?`, param.RoomCode).Scan(&openT, &closeT); err != nil {
			c.JSON(http.StatusOK, restful.Fail("DB ROOM", err))
			return
		}
		totalD = closeT.Sub(openT)

		var hist = make(map[string]*struct {
			dur  time.Duration
			name string
		})
		rows, err := db.Query(
			`SELECT a.entrance_time, a.exit_time, u.code, u.name FROM attendance a INNER JOIN user u ON a.user_code = u.code WHERE a.room_code = ?`,
			param.RoomCode,
		)
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		for rows.Next() {
			var (
				ettime time.Time
				extime time.Time
				ucode  string
				uname  string
			)
			err := rows.Scan(&ettime, &extime, &ucode, &uname)
			if err != nil {
				panic(err)
			}
			if data, ok := hist[ucode]; ok {
				data.dur += extime.Sub(ettime)
			} else {
				hist[ucode] = &struct {
					dur  time.Duration
					name string
				}{dur: extime.Sub(ettime), name: uname}
			}
		}
		for code, dat := range hist {
			tmp := "{}"
			tmp, _ = sjson.Set(tmp, "code", code)
			tmp, _ = sjson.Set(tmp, "name", dat.name)
			tmp, _ = sjson.Set(tmp, "percent", math.Max(math.Min(dat.dur.Seconds()/totalD.Seconds(), 1), 0))
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	//
	//
	apisvr.GET("/package", levelAboveEqual(2), func(c *gin.Context) {
		tmp, _ := c.Get("session")
		var (
			session = tmp.(*Session)
		)
		rows, err := db.Query(`SELECT pkg.code, pkg.name, pkg.description, count(ctt.package_code) FROM package pkg LEFT JOIN package_content ctt ON pkg.code = ctt.package_code WHERE pkg.owner = ? GROUP BY pkg.code, pkg.name, pkg.description`, session.User.Code)
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		var result = "[]"
		for rows.Next() {
			var (
				tmp              = "{}"
				code, name, desc string
				count            int
			)
			err := rows.Scan(&code, &name, &desc, &count)
			if err != nil {
				panic(err)
			}
			tmp, _ = sjson.Set(tmp, "code", code)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", desc)
			tmp, _ = sjson.Set(tmp, "count", count)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.POST("/package", levelAboveEqual(2), func(c *gin.Context) {
		tmp, _ := c.Get("session")
		var session = tmp.(*Session)
		var (
			param restful.APICreatePackage
			err   error
		)
		var (
			nextCodeNumber int
			nextCode       string
		)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if err = db.QueryRow(`
		SELECT
		max(CAST(TRIM(LEADING
		'PACK'
		FROM
		code) AS
		INTEGER )) + 1
		FROM package
		`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("PACK%06d", nextCodeNumber)
		_, err = db.Exec(
			`
		INSERT
		INTO package
		VALUES(?, ?, ?, ?)`,
			nextCode,
			param.Name,
			param.Description,
			session.User.Code,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("DB Insert fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.GET("/package/:package_code", func(c *gin.Context) {
		var (
			param restful.APIGetPackage
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			name   string
			desc   string
			count  int
			result = "{}"
		)
		err = db.QueryRow(
			`SELECT pkg.name, pkg.description, count(ctt.package_code) FROM package pkg LEFT JOIN package_content ctt ON pkg.code = ctt.package_code WHERE pkg.code = ? GROUP BY pkg.code, pkg.name, pkg.description`,
			param.PackageCode,
		).Scan(&name, &desc, &count)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusOK, restful.Fail("no row", nil))
				return
			} else {
				panic(err)
			}
		}
		result, _ = sjson.Set(result, "code", param.PackageCode)
		result, _ = sjson.Set(result, "name", name)
		result, _ = sjson.Set(result, "description", desc)
		result, _ = sjson.Set(result, "count", count)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.PUT("/package/:package_code", func(c *gin.Context) {
		var (
			param restful.APIEditPackage
			err   error
		)
		var (
			report = "{}"
		)
		report, _ = sjson.Set(report, "code", param.ProblemCode)
		report, _ = sjson.Set(report, "name", false)
		report, _ = sjson.Set(report, "description", false)
		//
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if param.Name == nil && param.Description == nil {
			c.JSON(http.StatusOK, restful.Success(json.RawMessage(report)))
			return
		}
		_, err = db.Exec(`
		UPDATE package
		SET
		name = IFNULL(?, name), description = IFNULL(?, description) 
		WHERE code =?`,
			param.Name,
			param.Description,
			param.ProblemCode,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("update fail", err))
			return
		}
		report, _ = sjson.Set(report, "name", param.Name != nil)
		report, _ = sjson.Set(report, "description", param.Description != nil)
		c.JSON(http.StatusOK, restful.Success(report))
		//c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.DELETE("/package/:package_code", func(c *gin.Context) {
		var (
			param restful.APIDeletePackage
			err   error
		)
		//
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var assginmentCounter int
		row := db.QueryRow(`SELECT count(ca.package_code) FROM package pkg LEFT JOIN course_assignment ca on pkg.code = ca.package_code WHERE pkg.code = ? GROUP BY pkg.code`, param.ProblemCode)
		if row.Err() != nil {
			c.JSON(http.StatusOK, restful.Fail("assignment inform get fail", row.Err()))
			return
		}
		if err = row.Scan(&assginmentCounter); err != nil {
			c.JSON(http.StatusOK, restful.Fail("counter fail", err))
			return
		}
		if assginmentCounter > 0 {
			c.JSON(http.StatusOK, restful.Fail("과제에 이미 등록된 패키지입니다.", nil))
			return
		}
		//
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("transaction fail", err))
			return
		}
		defer tx.Rollback()
		_, err = tx.Exec(`DELETE FROM package_content WHERE package_code=?`, param.ProblemCode)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		_, err = db.Exec(`DELETE FROM package WHERE code=?`, param.ProblemCode)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		tx.Commit()
		//
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/package/:package_code/problem", func(c *gin.Context) {
		var (
			param restful.APIGetAllProblem
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		rows, err := db.Query(
			`SELECT p.code, p.name, p.description, p.restriction, p.entry, p.parameters, p.return, p.type 
FROM problem p 
INNER JOIN package_content pc ON pc.problem_code = p.code 
WHERE pc.package_code = ?
`, param.PackageCode)
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		var result = "[]"
		for rows.Next() {
			var (
				code       string
				name       string
				desc       string
				rest       sql.NullString
				entry      sql.NullString
				parameters sql.NullString
				freturn    sql.NullString
				ftype      string
				tags       []string
				tmp        = "{}"
			)
			err := rows.Scan(&code, &name, &desc, &rest, &entry, &parameters, &freturn, &ftype)
			if err != nil {
				c.JSON(http.StatusOK, restful.Fail("scan fail", err))
				return
			}
			if tags, err = loadTags(code); err != nil {
				c.JSON(http.StatusOK, restful.Fail("tag fail", err))
				return
			}
			tmp, _ = sjson.Set(tmp, "code", code)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", desc)
			if rest.Valid {
				tmp, _ = sjson.Set(tmp, "restriction", rest.String)
			}
			if entry.Valid {
				tmp, _ = sjson.Set(tmp, "entry", entry.String)
			}
			if parameters.Valid {
				tmp, _ = sjson.Set(tmp, "parameters", parameters.String)
			}
			if freturn.Valid {
				tmp, _ = sjson.Set(tmp, "return", freturn.String)
			}
			tmp, _ = sjson.Set(tmp, "type", ftype)
			tmp, _ = sjson.Set(tmp, "tags", tags)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.POST("/package/:package_code/problem", func(c *gin.Context) {
		var (
			param restful.APIAddProblemToPackage
			err   error
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		//
		_, err = db.Exec("DELETE FROM package_content WHERE package_code=?", param.PackageCode)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("insert fail", err))
			return
		}
		var report = "{}"
		var totalSuccess = true
		for _, problem := range param.Problems {
			_, err = db.Exec("INSERT INTO package_content VALUES (?, ?)", param.PackageCode, problem)
			if err != nil {
				totalSuccess = false
				report, _ = sjson.Set(report, "each.-1", restful.Fail("insert fail", err))
			} else {
				report, _ = sjson.Set(report, "each.-1", restful.Success(nil))
			}
		}
		report, _ = sjson.Set(report, "total", totalSuccess)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(report)))
	})
	apisvr.DELETE("/package/:package_code/problem/:problem_code", func(c *gin.Context) {
		var (
			param restful.APIDeletePackageProblem
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		//
		_, err = db.Exec("DELETE FROM package_content WHERE package_code=? AND problem_code", param.PackageCode, param.ProblemCode)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	//
	apisvr.GET("/assignment/:assignment_code", func(c *gin.Context) {
		var (
			params restful.APIGetAssignment
			err    error
			result = "{}"
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			ccode string
			pcode string
			desc  string
			title string
		)
		err = db.QueryRow(`SELECT a.course_code, a.package_code,  a.description, a.path FROM course_assignment a WHERE a.code=?`, params.AssignmentCode).Scan(&ccode, &pcode, &desc, &title)
		if err != nil {
			panic(err)
		}
		result, _ = sjson.Set(result, "code", params.AssignmentCode)
		result, _ = sjson.Set(result, "package", pcode)
		result, _ = sjson.Set(result, "course", ccode)
		result, _ = sjson.Set(result, "description", desc)
		result, _ = sjson.Set(result, "title", title)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.GET("/assignment/:assignment_code/question", func(c *gin.Context) {
		var (
			params restful.APIGetAssignment
			err    error
			result = "[]"
			rows   *sql.Rows
			rows2  *sql.Rows
		)
		if err = c.ShouldBindUri(&params); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		rows, err = db.Query(`
SELECT q.code, q.title, q.description, a.path, a.description, u.code, u.name
FROM assignment_question q
         INNER JOIN course_assignment a on q.assignment_code = a.code
         INNER JOIN user u on q.user_code = u.code where a.code=?`, params.AssignmentCode)
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		for rows.Next() {
			var (
				tmp    = "{}"
				qcode  string
				qtitle string
				qdesc  string
				atitle string
				adesc  string
				ucode  string
				uname  string
			)
			if err = rows.Scan(&qcode, &qtitle, &qdesc, &atitle, &adesc, &ucode, &uname); err != nil {
				c.JSON(http.StatusOK, restful.Fail("scan fail", err))
				return
			}
			tmp, _ = sjson.Set(tmp, "code", qcode)
			tmp, _ = sjson.Set(tmp, "title", qtitle)
			tmp, _ = sjson.Set(tmp, "description", qdesc)
			tmp, _ = sjson.Set(tmp, "assignment.code", params.AssignmentCode)
			tmp, _ = sjson.Set(tmp, "assignment.title", atitle)
			tmp, _ = sjson.Set(tmp, "assignment.description", adesc)
			tmp, _ = sjson.Set(tmp, "user.code", ucode)
			tmp, _ = sjson.Set(tmp, "user.name", uname)
			//
			rows2, err = db.Query(`
SELECT a.description, u.name,u.code
FROM question_answer a
         INNER JOIN user u ON a.user_code = u.code 
         WHERE a.question_code=? 
         ORDER BY a.idx`, qcode)
			if err != nil {
				c.JSON(http.StatusOK, restful.Fail("inner query fail", err))
				return
			}
			defer rows2.Close()
			for rows2.Next() {
				var (
					ansDesc       string
					ansWriterCode string
					ansWriter     string
					ans           = "{}"
				)
				if err = rows2.Scan(&ansDesc, &ansWriter, &ansWriterCode); err != nil {
					c.JSON(http.StatusOK, restful.Fail("inner query scan fail", err))
					return
				}
				ans, _ = sjson.Set(ans, "description", ansDesc)
				ans, _ = sjson.Set(ans, "writer.code", ansWriterCode)
				ans, _ = sjson.Set(ans, "writer.name", ansWriter)
				tmp, _ = sjson.SetRaw(tmp, "answer.-1", ans)
			}
			//
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.POST("/assignment/:assignment_code/question", checkSession(), func(c *gin.Context) {
		sess := c.MustGet("session").(*Session)
		var (
			param restful.APIAddQuestion
			err   error
		)
		var (
			nextCodeNumber int
			nextCode       string
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if err = db.QueryRow(`
		SELECT
		max(CAST(TRIM(LEADING
		'QUES'
		FROM
		code) AS
		INTEGER )) + 1
		FROM assignment_question
		`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("QUES%06d", nextCodeNumber)
		//
		_, err = db.Exec(
			`INSERT INTO assignment_question(code, assignment_code, user_code, title, description) VALUES (?, ?, ?, ?, ?)`,
			nextCode,
			param.AssignmentCode,
			sess.User.Code,
			param.Title,
			param.Description,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("execution fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.POST("/answer/:question_code", checkSession(), func(c *gin.Context) {
		sess := c.MustGet("session").(*Session)
		var (
			param restful.APIAddAnswer
			err   error
		)
		var (
			nextCodeNumber int
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if err = db.QueryRow(`
		SELECT
		max(idx) + 1
		FROM question_answer WHERE question_code=?`, param.QuestionCode).Scan(&nextCodeNumber); err != nil {
			nextCodeNumber = 0
		}
		//
		_, err = db.Exec(
			`INSERT INTO question_answer(question_code, idx, user_code, description)  VALUES (?, ?, ?, ?)`,
			param.QuestionCode,
			nextCodeNumber,
			sess.User.Code,
			param.Description,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("execution fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})

	apisvr.POST("/assignment/:assignment_code/submission/:problem_code", checkSession(), func(c *gin.Context) {
		tmp, _ := c.Get("session")
		var session = tmp.(*Session)
		var (
			param restful.APISubmissionProblem
			err   error
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var dstFile = uuid.New()
		var dstFilePath = path.Join("fs", dstFile.String())
		if err = c.SaveUploadedFile(param.Source, dstFilePath); err != nil {
			c.JSON(http.StatusOK, restful.Fail("file save fail", err))
			return
		}
		//
		_, err = db.Exec(`INSERT INTO assignment_submission VALUES(?, ?, ?, ?, ?)`, param.AssignmentCode, param.ProblemCode, session.User.Code, dstFilePath, param.Language)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("db save fail", err))
			return
		}

		//
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/assignment/:assignment_code/scoring", func(c *gin.Context) {
		var (
			param restful.APIAssignmentScoring
			err   error
			rows  *sql.Rows
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid uri parameter", err))
			return
		}
		//
		var (
			// code, type
			problems [][2]string
			students []string
		)
		rows, err = db.Query(`SELECT ce.user_code FROM course_assignment ca INNER JOIN course_enrolment ce on ca.course_code = ce.course_code WHERE ca.code = ?`, param.Assignment)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("user load fail", err))
			return
		}
		defer rows.Close()
		for rows.Next() {
			var (
				studentCode string
			)
			if err = rows.Scan(&studentCode); err != nil {
				c.JSON(http.StatusOK, restful.Fail("user loading fail", err))
				return
			}
			students = append(students, studentCode)
		}
		rows2, err := db.Query(`SELECT pc.problem_code, p2.type
FROM course_assignment ca
         INNER JOIN package p on ca.package_code = p.code
         INNER JOIN package_content pc on p.code = pc.package_code
         INNER JOIN problem p2 on pc.problem_code = p2.code
WHERE ca.code = ?`, param.Assignment)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("problem load fail", err))
			return
		}
		defer rows2.Close()
		for rows2.Next() {
			var (
				problemCode string
				problemType string
			)
			if err = rows.Scan(&problemCode, &problemType); err != nil {
				c.JSON(http.StatusOK, restful.Fail("user loading fail", err))
				return
			}
			problems = append(problems, [2]string{problemCode, problemType})
		}
		//
		var report = "{}"
		report, _ = sjson.Set(report, "students", students)
		for i, problem := range problems {
			report, _ = sjson.Set(report, fmt.Sprintf("problem.%d.code", i), problem[0])
			report, _ = sjson.Set(report, fmt.Sprintf("problem.%d.type", i), problem[1])
		}
		for _, problem := range problems {
			var (
				problemCode = problem[0]
				problemType = problem[1]
				entry       string
				params      []coding.Type
				ret         coding.Type
			)
			if problemType == "programming" {
				var (
					rawParams string
					rawRet    string
				)
				row := db.QueryRow("SELECT p.entry, p.parameters, p.return FROM problem p WHERE p.code = ?", problemCode)
				if row.Err() != nil {
					c.JSON(http.StatusOK, restful.Fail("fail to problem", row.Err()))
					return
				}
				//
				if err = row.Scan(&entry, &rawParams, &rawRet); err != nil {
					c.JSON(http.StatusOK, restful.Fail("fail to problem scan", row.Err()))
					return
				}
				params = coding.ParseTypes(splitArr(rawParams)...)
				ret = coding.ParseType(gjson.Parse(rawRet).String())
			}
			for _, student := range students {
				//
				var (
					score float64
				)
				err = db.QueryRow(`SELECT score FROM handscore WHERE assignment_code=? and problem_code=? and user_code=?`, param.Assignment, problemCode, student).Scan(&score)
				if err == nil {
					report, _ = sjson.Set(report, fmt.Sprintf("%s.%s", problemCode, student), score)
				} else if errors.Is(err, sql.ErrNoRows) {
					switch problemType {
					case "programming":
						var (
							submission   string
							languageCode string
						)
						row := db.QueryRow(`SELECT a.path, a.language FROM assignment_submission a WHERE a.assignment_code=? and a.problem_code=? and a.user_code=?`, param.Assignment, problemCode, student)
						if err = row.Scan(&submission, &languageCode); err != nil {
							if errors.Is(err, sql.ErrNoRows) {
								report, _ = sjson.Set(report, fmt.Sprintf("%s.%s", problemCode, student), nil)
								continue
							}
							c.JSON(http.StatusOK, restful.Fail("scan fail", row.Err()))
							return
						}
						var (
							lang = coding.LoadLang(languageCode)
						)
						if lang == nil {
							c.JSON(http.StatusOK, restful.Fail("no language : "+languageCode, nil))
							return
						}
						f, err := os.Open(submission)
						if err != nil {
							c.JSON(http.StatusOK, restful.Fail("no file", err))
							return
						}
						defer f.Close()
						inst, err := lang.Build(f, entry, params, ret)
						if err != nil {
							c.JSON(http.StatusOK, restful.Fail("instance fail", err))
							return
						}
						defer inst.Close()
						//
						idx, _ := restful.ParseIndexing("~")
						ios := gjson.ParseBytes(selectIORange(problemCode, idx[0], idx[1]))
						length := ios.Get("#").Int()
						//
						problemReport := "{}"
						for i := int64(0); i < length; i++ {
							tmp := ios.Get(strconv.FormatInt(i, 10))
							callParams := coding.ParseValues(params, splitArr(tmp.Get("input").Raw)...)
							callRet := coding.ParseValue(ret, tmp.Get("output").Raw)
							runRet, err := inst.Run(callParams)
							if err != nil {
								c.JSON(http.StatusOK, restful.Fail("run failure", err))
								return
							}
							reportEach := "{}"
							reportEach, _ = sjson.Set(reportEach, "expected", callRet)
							reportEach, _ = sjson.Set(reportEach, "actual", runRet)
							reportEach, _ = sjson.Set(reportEach, "result", runRet.EqualValue(callRet))
							problemReport, _ = sjson.SetRaw(problemReport, "cases.-1", reportEach)
						}
						// 채점 완료
						report, _ = sjson.SetRaw(report, fmt.Sprintf("%s.%s", problemCode, student), problemReport)
					case "short":
						report, _ = sjson.Set(report, fmt.Sprintf("%s.%s", problemCode, student), nil)
					case "multiple":
						report, _ = sjson.Set(report, fmt.Sprintf("%s.%s", problemCode, student), nil)

					}
				} else {
					c.JSON(http.StatusOK, restful.Fail("handscore fail to scan", err))
					return
				}

			}
		}
		//
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(report)))
	})
	apisvr.GET("/assignment/:assignment_code/submission/:problem_code/read/:user_code", func(c *gin.Context) {
		var (
			param restful.APIReadSubmission
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		row := db.QueryRow(`SELECT path, language FROM assignment_submission WHERE assignment_code=? and problem_code=? and user_code=?`, param.Assignment, param.Problem, param.User)
		var (
			pathFile string
			lang     string
		)
		if err = row.Scan(&pathFile, &lang); err != nil {
			c.JSON(http.StatusOK, restful.Fail("query fail", err))
			return
		}
		data, err := ioutil.ReadFile(pathFile)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("file error", err))
			return
		}
		result := "{}"
		result, _ = sjson.Set(result, "data", string(data))
		result, _ = sjson.Set(result, "language", lang)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.PUT("/assignment/:assignment_code/submission/:problem_code/manual-score/:user_code", func(c *gin.Context) {
		var (
			param restful.APIEditScore
			err   error
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`INSERT INTO handscore VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE score=?`, param.Assignment, param.Problem, param.User, param.Score, param.Score)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("db update fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	//
	apisvr.POST("/problem", levelAboveEqual(2), func(c *gin.Context) {
		var (
			param restful.APICreateProblem
			err   error
		)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			nextCodeNumber int
			nextCode       string
		)
		if err = db.QueryRow(`
		SELECT max(CAST(TRIM(LEADING 'P' FROM code) AS INTEGER )) + 1
		FROM problem
		`).Scan(&nextCodeNumber); err != nil {
			panic(err)
		}
		nextCode = fmt.Sprintf("P%09d", nextCodeNumber)
		// 문제 생성
		_, err = db.Exec(
			`
		INSERT
		INTO problem
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			nextCode,
			param.Name,
			param.Description,
			param.Restriction,
			param.Entry,
			param.Parameters,
			param.Return,
			param.Type,
			param.ParameterNames,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("DB Insert fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nextCode))
	})
	apisvr.PUT("/problem/:problem_code", func(c *gin.Context) {
		var (
			param restful.APIEditProblem
			err   error
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		// 문제 생성
		_, err = db.Exec(
			`
		UPDATE problem p SET p.name=?, p.description=?, p.type=?, p.restriction=?, p.entry=?, p.parameters=?, p.return=? WHERE code=?`,
			param.Name,
			param.Description,
			param.Type,
			param.Restriction,
			param.Entry,
			param.Parameters,
			param.Return,
			param.Code,
		)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("DB Insert fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.DELETE("/problem/:problem_code", func(c *gin.Context) {
		var (
			param restful.APIDeleteProblem
			err   error
		)
		//
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`DELETE FROM handscore WHERE problem_code=?`, param.Code)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		_, err = db.Exec(`DELETE FROM package_content WHERE problem_code=?`, param.Code)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		_, err = db.Exec(`DELETE FROM problem WHERE code=?`, param.Code)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("delete fail", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/problem/:problem_code/signature/:language", func(c *gin.Context) {
		var (
			param restful.APISignatureProblem
			err   error
			row   *sql.Row
		)
		var (
			entry         string
			rawParams     string
			rawRet        string
			rawParamNames string
			params        []coding.Type
			ret           coding.Type
			lang          coding.Language
			paramNames    []string
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if row = db.QueryRow("SELECT p.entry, p.parameters, p.return, p.parameterNames FROM problem p WHERE p.code = ?", param.ProblemCode); row.Err() != nil {
			c.JSON(http.StatusOK, restful.Fail("fail to problem", row.Err()))
			return
		}
		if err = row.Scan(&entry, &rawParams, &rawRet, &rawParamNames); err != nil {
			panic(err)
		}
		//
		lang = coding.LoadLang(param.Language)
		params = coding.ParseTypes(splitArr(rawParams)...)
		ret = coding.ParseType(gjson.Parse(rawRet).String())
		paramNames = splitArr(rawParamNames)
		if lang == nil {
			c.JSON(http.StatusOK, restful.Fail("no language", nil))
			return
		}
		//

		c.JSON(http.StatusOK, restful.Success(lang.Signature(entry, params, ret, paramNames)))
	})
	apisvr.POST("/problem/:problem_code/solve/:language", func(c *gin.Context) {
		var (
			param restful.APISolveProblem
			err   error
			row   *sql.Row
		)
		var (
			entry     string
			rawParams string
			rawRet    string
			params    []coding.Type
			ret       coding.Type
			lang      coding.Language
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if row = db.QueryRow("SELECT p.entry, p.parameters, p.return FROM problem p WHERE p.code = ?", param.ProblemCode); row.Err() != nil {
			c.JSON(http.StatusOK, restful.Fail("fail to problem", row.Err()))
			return
		}
		//
		if err = row.Scan(&entry, &rawParams, &rawRet); err != nil {
			panic(err)
		}
		//
		lang = coding.LoadLang(param.Language)
		params = coding.ParseTypes(splitArr(rawParams)...)
		ret = coding.ParseType(gjson.Parse(rawRet).String())
		if lang == nil {
			c.JSON(http.StatusOK, restful.Fail("no language", nil))
			return
		}
		//
		var (
			f    multipart.File
			inst coding.Instance
		)
		f, err = param.Source.Open()
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("unexpected error", err))
			return
		}
		defer f.Close()

		inst, err = lang.Build(f, entry, params, ret)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("unexpected error", err))
			return
		}
		defer inst.Close()
		//
		idx, _ := restful.ParseIndexing("~")
		ios := gjson.ParseBytes(selectIORange(param.ProblemCode, idx[0], idx[1]))
		length := ios.Get("#").Int()
		//
		report := "{}"
		total := true
		for i := int64(0); i < length; i++ {
			tmp := ios.Get(strconv.FormatInt(i, 10))
			callParams := coding.ParseValues(params, splitArr(tmp.Get("input").String())...)
			callRet := coding.ParseValue(ret, tmp.Get("output").String())
			runRet, err := inst.Run(callParams)
			if err != nil {
				c.JSON(http.StatusOK, restful.Fail("run failure", err))
				return
			}
			reportEach := "{}"
			reportEach, _ = sjson.Set(reportEach, "expected", callRet)
			reportEach, _ = sjson.Set(reportEach, "actual", runRet)
			if runRet == nil {
				reportEach, _ = sjson.Set(reportEach, "result", false)
				total = false
			} else {
				reportEach, _ = sjson.Set(reportEach, "result", runRet.EqualValue(callRet))
				total = total && runRet.EqualValue(callRet)
			}
			report, _ = sjson.SetRaw(report, "cases.-1", reportEach)
		}
		report, _ = sjson.Set(report, "total", total)
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(report)))
	})
	apisvr.GET("/problem", func(c *gin.Context) {
		var (
			rows *sql.Rows
			err  error
		)
		var (
			result = "[]"
		)
		rows, err = db.Query("SELECT p.code, p.name, p.description, p.restriction, p.entry, p.parameters,p.parameterNames, p.return, p.type FROM problem p")
		if err != nil {
			panic(err)
		}
		defer rows.Close()
		for rows.Next() {
			var (
				code           string
				name           string
				desc           string
				rest           sql.NullString
				entry          sql.NullString
				param          sql.NullString
				parameterNames sql.NullString
				freturn        sql.NullString
				ftype          string
				tmp            = "{}"
			)
			err = rows.Scan(&code, &name, &desc, &rest, &entry, &param, &parameterNames, &freturn, &ftype)
			if err != nil {
				c.JSON(http.StatusOK, restful.Fail("scan error", err))
				return
			}
			tmp, _ = sjson.Set(tmp, "code", code)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", desc)
			tmp, _ = sjson.Set(tmp, "type", ftype)
			if rest.Valid {
				tmp, _ = sjson.Set(tmp, "restriction", rest.String)
			}
			if entry.Valid {
				tmp, _ = sjson.Set(tmp, "entry", entry.String)
			}
			if param.Valid {
				tmp, _ = sjson.Set(tmp, "parameters", param.String)
			}
			if parameterNames.Valid {
				tmp, _ = sjson.Set(tmp, "parameter_names", parameterNames.String)
			}
			if freturn.Valid {
				tmp, _ = sjson.Set(tmp, "return", freturn.String)
			}
			tmp, _ = sjson.Set(tmp, "tags", selectTag(code))
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}

		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.GET("/problem/:problem_code", func(c *gin.Context) {
		var (
			param restful.APIGetProblem
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		var (
			code           string
			name           string
			desc           string
			ftype          string
			rest           sql.NullString
			entry          sql.NullString
			parameters     sql.NullString
			parameterNames sql.NullString
			freturn        sql.NullString
			result         = "{}"
		)
		err = db.QueryRow(
			"SELECT p.code, p.type, p.name, p.description, p.restriction, p.entry, p.parameters, p.parameterNames, p.return FROM problem p WHERE p.code =?",
			param.ProblemCode,
		).Scan(&code, &ftype, &name, &desc, &rest, &entry, &parameters, &parameterNames, &freturn)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusOK, restful.Fail("no row", nil))
				return
			} else {
				panic(err)
			}
		}
		result, _ = sjson.Set(result, "code", code)
		result, _ = sjson.Set(result, "name", name)
		result, _ = sjson.Set(result, "description", desc)
		result, _ = sjson.Set(result, "type", ftype)
		if rest.Valid {
			result, _ = sjson.Set(result, "restriction", rest.String)
		}
		if entry.Valid {
			result, _ = sjson.Set(result, "entry", entry.String)
		}
		if parameters.Valid {
			result, _ = sjson.Set(result, "parameters", parameters.String)
		}
		if parameterNames.Valid {
			result, _ = sjson.Set(result, "parameter_names", parameterNames.String)
		}
		if freturn.Valid {
			result, _ = sjson.Set(result, "return", freturn.String)
		}
		result, _ = sjson.Set(result, "tags", selectTag(code))
		c.JSON(http.StatusOK, restful.Success(json.RawMessage(result)))
	})
	apisvr.PUT("/problem/:problem_code/tag/:tag", func(c *gin.Context) {
		var (
			param restful.APIPutProblemTag
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`
		INSERT
		INTO
		tag(problem_code, tag)
		VALUES(?, ?)`, param.ProblemCode, param.Tag)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.DELETE("/problem/:problem_code/tag/:tag", func(c *gin.Context) {
		var (
			param restful.APIDeleteProblemTag
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`
		DELETE
		FROM
		tag
		WHERE
		problem_code = ? AND
		tag = ?`, param.ProblemCode, param.Tag)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.DELETE("/problem/:problem_code/tag", func(c *gin.Context) {
		var (
			param restful.APIDeleteProblemTagAll
			err   error
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`
		DELETE
		FROM
		tag
		WHERE
		problem_code = ?`, param.ProblemCode)
		if err != nil {
			panic(err)
		}
		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/problem/:problem_code/io", func(c *gin.Context) { c.Redirect(http.StatusPermanentRedirect, "io/~") })
	apisvr.POST("/problem/:problem_code/io", func(c *gin.Context) {
		var (
			param restful.APICreateProblemCase
			err   error
		)
		c.ShouldBindUri(&param)
		if err = c.ShouldBind(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		_, err = db.Exec(`DELETE FROM problem_io WHERE problem_code=?`, param.Code)
		if err != nil {
			c.JSON(http.StatusOK, restful.Fail("db fail", err))
			return
		}
		stmt, err := db.Prepare(`INSERT INTO problem_io VALUES (?, ?, ?, ?, ?)`)
		for i, cs := range param.Cases {
			_, err = stmt.Exec(param.Code, i, cs.Input, cs.Output, cs.Visible)
			if err != nil {
				c.JSON(http.StatusOK, restful.Fail("db fail", err))
				return
			}
		}
		defer stmt.Close()

		c.JSON(http.StatusOK, restful.Success(nil))
	})
	apisvr.GET("/problem/:problem_code/io/:indexing", func(c *gin.Context) {
		var (
			param restful.APIGetProblemIO
			err   error
			rng   [2]uint64
		)
		if err = c.ShouldBindUri(&param); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter", err))
			return
		}
		if rng, err = restful.ParseIndexing(param.Indexing); err != nil {
			c.JSON(http.StatusOK, restful.Fail("invalid parameter 'indexing'", err))
			return
		}
		c.JSON(http.StatusOK, restful.Success(selectIORange(param.ProblemCode, rng[0], rng[1])))
	})
	//
	apisvr.GET("/coding/:language", func(c *gin.Context) {
		var (
			language = coding.LoadLang(c.Param("language"))
		)
		if language == nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		c.JSON(http.StatusOK, map[string]interface{}{
			"name":    language.Name(),
			"version": language.Version().String(),
		})
	})
	apisvr.POST("/coding/:language", func(c *gin.Context) {
		var (
			language = coding.LoadLang(c.Param("language"))
			method   = c.PostForm("entry")
			params   = c.PostForm("params")
			ret      = c.PostForm("return")
			call     = c.PostForm("call")
			ffh, err = c.FormFile("src")
		)
		if language == nil {
			logger.Printf("no language %s", c.Param("language"))
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		if err != nil {
			logger.Printf("no src, %e", err)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		f, err := ffh.Open()
		if err != nil {
			logger.Printf("open src fail, %e", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		defer f.Close()
		//
		parsedParams := coding.ParseTypes(splitArr(params)...)
		parsedRet := coding.ParseType(ret)
		if parsedParams == nil {
			logger.Printf("parse params fail, %s", params)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		if parsedRet == nil {
			logger.Printf("parse ret fail, %s", ret)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		// 인스턴스 생성
		inst, err := language.Build(f, method, parsedParams, parsedRet)
		if err != nil {
			logger.Printf("instance fail, %e", err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		defer inst.Close()
		parsedCall := coding.ParseValues(parsedParams, splitArr(call)...)
		if parsedCall == nil {
			logger.Printf("parse call fail, %s", call)
			fmt.Println(splitArr(call))
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		callResult, err := inst.Run(parsedCall)
		if err != nil {
			logger.Printf("call fail, %e", err)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		c.JSON(http.StatusOK, callResult)

	})
	// 수강목록 리턴
}

//
func setupSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		state, err := c.Cookie("state")
		if err != nil {
			return
		}
		sess, ok := session[state]
		if !ok {
			return
		}
		c.Set("state", state)
		c.Set("session", sess)
	}
}
func checkSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		state, err := c.Cookie("state")
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		sess, ok := session[state]
		if !ok {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set("state", state)
		c.Set("session", sess)
	}
}
func levelCondition(f func(level int) bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess, ok := c.Get("session")
		if !ok {
			checkSession()(c)
			if c.IsAborted() {
				return
			}
			sess = c.MustGet("session")
		}
		if !f(sess.(*Session).Auth.Level) {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}
func levelAboveEqual(level int) gin.HandlerFunc {
	return func(c *gin.Context) {
		sess, ok := c.Get("session")
		if !ok {
			checkSession()(c)
			if c.IsAborted() {
				return
			}
			sess = c.MustGet("session")
		}
		if !(level <= sess.(*Session).Auth.Level) {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}
func checkNoSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		state, _ := c.Cookie("state")
		_, ok := session[state]
		if ok {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
	}
}

//

//
func isAdmin(sess *Session) bool {
	return sess.Auth.Level >= 999
}
func parseUnixOrRFC3339(stime string) sql.NullTime {
	t, err := time.Parse(time.RFC3339, stime)
	if err == nil {
		return sql.NullTime{
			Time:  t,
			Valid: true,
		}
	}
	u, err := strconv.ParseInt(stime, 10, 64)
	if err == nil {
		return sql.NullTime{
			Time:  time.Unix(u, 0),
			Valid: true,
		}
	}
	return sql.NullTime{
		Time:  time.Unix(0, 0),
		Valid: false,
	}
}
func countAffectedRows(result sql.Result) int {
	c, err := result.RowsAffected()
	if err != nil {
		return 0
	}
	return int(c)
}
func mysqlError(err error, mysqlErrHandle func(err *mysql.MySQLError), otherErrHandle func()) {
	if myerr, ok := err.(*mysql.MySQLError); ok {
		mysqlErrHandle(myerr)
	} else {
		otherErrHandle()
	}
}
func selectIORange(pcode string, start, end uint64) json.RawMessage {
	var result = "[]"
	rows, err := db.Query(`
		SELECT
		pio.input, pio.output, pio.visible
		FROM
		problem_io
		pio
		WHERE
		pio.problem_code = ?
		ORDER
		BY
		pio.idx
		LIMIT ? OFFSET ? `,
		pcode,
		end-start,
		start,
	)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		var (
			i   string
			o   string
			v   bool
			tmp = "{}"
		)
		err := rows.Scan(&i, &o, &v)
		if err != nil {
			panic(err)
		}
		tmp, _ = sjson.Set(tmp, "input", i)
		tmp, _ = sjson.Set(tmp, "output", o)
		tmp, _ = sjson.Set(tmp, "visible", v)
		result, _ = sjson.SetRaw(result, "-1", tmp)
	}
	return json.RawMessage(result)
}
func selectTag(pcode string) json.RawMessage {
	var result = "[]"
	rows, err := db.Query(`
		SELECT
		tag
		FROM
		tag
		WHERE
		tag.problem_code = ?`,
		pcode,
	)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		var (
			t string
		)
		if err := rows.Scan(&t); err != nil {
			panic(err)
		}
		result, _ = sjson.Set(result, "-1", t)
	}
	return json.RawMessage(result)
}
func noCache(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
}
func loadTags(pcode string) (result []string, err error) {
	var rows *sql.Rows
	result = make([]string, 0)
	rows, err = db.Query(`SELECT tag FROM tag WHERE problem_code=?`, pcode)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tag string
		if err = rows.Scan(&tag); err != nil {
			return nil, err
		}
		result = append(result, tag)
	}
	return result, nil
}

//
func splitArr(arr string) []string {
	parsed := gjson.Parse(arr)
	if !parsed.IsArray() {
		return nil
	}
	parr := parsed.Array()
	res := make([]string, len(parr))
	for i, elem := range parr {
		res[i] = elem.String()
	}
	return res
}
func main() {
	err := ready()
	if err != nil {
		panic(err)
	}
	setup()
	defer func() {
		db.Close()
	}()
	engine.Run(":http")
}
