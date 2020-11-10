package main

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/TeamProjectWSE/PracticeManagementSystem/server/coding"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

const MimeUtf8Json = "application/json; charset=utf-8"

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
	extras map[string]interface{} `json:"extras,omitempty"`
}

const (
	GOOGLEAPI_USERINFO              = "https://www.googleapis.com/oauth2/v3/userinfo"
	GOOGLEAPISCOPE_USERINFO_EMAIL   = "https://www.googleapis.com/auth/userinfo.email"
	GOOGLEAPISCOPE_USERINFO_PROFILE = "https://www.googleapis.com/auth/userinfo.profile"
)

const ServerUrl = "http://ddiggo.iptime.org"

var (
	session      map[string]*Session
	config       gjson.Result
	db           *sql.DB
	engine       *gin.Engine
	oauth2Google *oauth2.Config
	logger       *log.Logger
)

func ready() (err error) {
	bts, err := ioutil.ReadFile("./.local.json")
	if err != nil {
		return err
	}
	config = gjson.ParseBytes(bts)
	//
	fmt.Println((&mysql.Config{
		User:   "lacolico",
		Passwd: "1q2w3e4r!",
		Net:    "tcp",
		Addr:   "sunshine.ceh2bnjpp9j5.ap-northeast-2.rds.amazonaws.com:3306",
		DBName: "coditnator",
		Params: map[string]string{
		},
		AllowNativePasswords: true,
	}).FormatDSN())
	db, err = sql.Open(
		"mysql",
		(&mysql.Config{
			User:   "lacolico",
			Passwd: "1q2w3e4r!",
			Net:    "tcp",
			Addr:   "sunshine.ceh2bnjpp9j5.ap-northeast-2.rds.amazonaws.com:3306",
			DBName: "coditnator",
			Params: map[string]string{
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
	coding.SetupLang(coding.PYTHON, coding.MustPython(config.Get("coding.python").String()))
	return nil
}
func setup() {
	engine.GET("/", func(c *gin.Context) { c.Redirect(http.StatusPermanentRedirect, "/static/index.html") })
	engine.Static("/static", "./root")
	// 로그인
	engine.GET("/auth", func(c *gin.Context) {
		state, err := c.Cookie("state")
		if err != nil {
			c.JSON(http.StatusOK, new(Session))
			return
		}
		sess, ok := session[state]
		if !ok {
			c.JSON(http.StatusOK, new(Session))
			return
		}
		c.JSON(http.StatusOK, sess)
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
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		defer userinfo.Body.Close()
		userinfoBytes, err := ioutil.ReadAll(userinfo.Body)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		email := gjson.ParseBytes(userinfoBytes).Get("email").String()
		row := db.QueryRow("SELECT u.code, u.name, a.code, a.name, a.level FROM `user` u INNER JOIN login l on u.code = l.target_user INNER JOIN authority a on u.authority_code = a.code WHERE l.identifier = ? AND l.hash_or_extern = 'google'", email)
		if row == nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		//
		mksess := new(Session)
		err = row.Scan(&mksess.User.Code, &mksess.User.Name, &mksess.Auth.Code, &mksess.Auth.Name, &mksess.Auth.Level)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			fmt.Printf("error : %e\n", err)
			//fmt.Errorf("error : %e\n", err)
			return
		}
		session[state] = mksess
		c.SetCookie("state", state, int(1*time.Hour/time.Second), "", "", false, true)
		c.Redirect(http.StatusPermanentRedirect, "/")
	})
	engine.GET("/auth/logout", checkSession(), func(c *gin.Context) {
		delete(session, c.MustGet("state").(string))
		c.Redirect(http.StatusPermanentRedirect, "/")
	})
	engine.GET("/auth/session", checkSession(), func(c *gin.Context) {
		sess := c.MustGet("session").(*Session)
		c.JSON(http.StatusOK, sess)
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
	engine.GET("/api/course", func(c *gin.Context) {
		rows, err := db.Query("SELECT c.code, c.name, c.description, u.code, u.name FROM `course` c INNER JOIN `user` u ON c.user_code = u.code")
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
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
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			tmp, _ = sjson.SetBytes(tmp, "code", code)
			tmp, _ = sjson.SetBytes(tmp, "name", name)
			tmp, _ = sjson.SetBytes(tmp, "description", description)
			tmp, _ = sjson.SetBytes(tmp, "instructor.code", instructorCode)
			tmp, _ = sjson.SetBytes(tmp, "instructor.name", instructorName)
			result, _ = sjson.SetRawBytes(result, "-1", tmp)
		}
		c.Data(http.StatusOK, "application/json; charset=utf-8", result)
	})
	engine.POST("/api/course", levelAboveEqual(2), func(c *gin.Context) {
		var (
			code, isCode = c.GetPostForm("code")
			name, isName = c.GetPostForm("name")
			description  = c.PostForm("description")
			session      = c.MustGet("session").(*Session)
		)
		if !isCode || !isName {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, err := db.Exec(
			`INSERT INTO course(code, name, description, user_code) VALUES (?, ?, ?, ?)`,
			code,
			name,
			description,
			session.User.Code,
		)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	})
	engine.GET("/api/course/:course_id", course, func(c *gin.Context) {
		c.Data(http.StatusOK, MimeUtf8Json, []byte(c.GetString("course")))
	})
	engine.GET("/api/course/:course_id/room", func(c *gin.Context) {
		var (
			result   = "[]"
			courseId = c.Param("course_id")
		)
		rows, err := db.Query(`SELECT c.name, c.description, u.code, u.name FROM course c INNER JOIN user u ON u.code = c.user_code WHERE c.code = ?`,
			courseId,
		)
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		for rows.Next() {
			var (
				name           string
				description    string
				instructorCode string
				instructorName string
				tmp            = "{}"
			)
			err = rows.Scan(&name, &description, &instructorCode, &instructorName)
			if err != nil {
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			tmp, _ = sjson.Set(tmp, "code", courseId)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", description)
			tmp, _ = sjson.Set(tmp, "instructor.code", instructorCode)
			tmp, _ = sjson.Set(tmp, "instructor.name", instructorName)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.Data(http.StatusOK, MimeUtf8Json, []byte(result))
	})
	engine.POST("/api/course/:course_id/room", course, levelAboveEqual(2), func(c *gin.Context) {
		var (
			sess         = c.MustGet("session").(*Session)
			cour         = c.GetString("course")
			code, isCode = c.GetPostForm("code")
			name, isName = c.GetPostForm("name")
			desc         = c.PostForm("description")
		)
		if sess.User.Code != gjson.Get(cour, "instructor.code").String() {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if !isCode || !isName {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, err := db.Exec(
			`INSERT INTO course_room(code, name, description) VALUES (?, ?, ?)`,
			code,
			name,
			desc,
		)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	})
	engine.GET("/api/course/:course_id/room/:room_id", room, func(c *gin.Context) {
		c.Data(http.StatusOK, MimeUtf8Json, []byte(c.GetString("room")))
	})
	engine.GET("/api/course/:course_id/room/:room_id/attendance", func(c *gin.Context) {
		var (
			result   = "[]"
			courseId = c.Param("course_id")
			roomId   = c.Param("room_id")
		)
		rows, err := db.Query(
			`SELECT a.entrance_time, a.exit_time, u.code, u.name FROM attendance a INNER JOIN user u ON a.user_code = u.code WHERE a.course_code = ?, a.room_code = ?`,
			courseId,
			roomId,
		)
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		for rows.Next() {
			var (
				tmp    = "{}"
				ettime time.Time
				extime sql.NullTime
				ucode  string
				uname  string
			)
			err := rows.Scan(&ettime, &extime, &ucode, &uname)
			if err != nil {
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			tmp, _ = sjson.Set(tmp, "entrance_time", ettime.Format(time.RFC3339))
			if extime.Valid {
				tmp, _ = sjson.Set(tmp, "exit_time", extime.Time.Format(time.RFC3339))
			}
			tmp, _ = sjson.Set(tmp, "course.code", courseId)
			tmp, _ = sjson.Set(tmp, "room.code", roomId)
			tmp, _ = sjson.Set(tmp, "user.code", ucode)
			tmp, _ = sjson.Set(tmp, "user.name", uname)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.Data(http.StatusOK, MimeUtf8Json, []byte(result))
	})
	//
	engine.GET("/api/package", func(c *gin.Context) {
		rows, err := db.Query("SELECT code, name, description FROM package")
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		var result = "[]"
		for rows.Next() {
			var (
				tmp              = "{}"
				code, name, desc string
			)
			err := rows.Scan(&code, &name, &desc)
			if err != nil {
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			tmp, _ = sjson.Set(tmp, "code", code)
			tmp, _ = sjson.Set(tmp, "name", name)
			tmp, _ = sjson.Set(tmp, "description", desc)
			result, _ = sjson.SetRaw(result, "-1", tmp)
		}
		c.Data(http.StatusOK, MimeUtf8Json, []byte(result))
	})
	engine.POST("/api/package", func(c *gin.Context) {})
	engine.GET("/api/package/:package_id", pkg, func(c *gin.Context) { c.Data(http.StatusOK, MimeUtf8Json, []byte(c.GetString("package"))) })
	engine.GET("/api/package/:package_id/problem", func(c *gin.Context) {})
	engine.POST("/api/package/:package_id/problem", func(c *gin.Context) {})
	engine.PUT("/api/package/:package_id/problem/tag/:tagname", func(c *gin.Context) {})
	engine.DELETE("/api/package/:package_id/problem/tag/:tagname", func(c *gin.Context) {})

	engine.GET("/api/package/:package_id/problem/:problem", func(c *gin.Context) {})
	engine.GET("/api/package/:package_id/problem/:problem/io", func(c *gin.Context) {})
	engine.GET("/api/package/:package_id/problem/:problem/io/:index", func(c *gin.Context) {})
	engine.POST("/api/package/:package_id/problem/:problem/io", func(c *gin.Context) {})
	//
	engine.GET("/api/coding/:language", func(c *gin.Context) {
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
	engine.POST("/api/coding/:language", func(c *gin.Context) {
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
	//engine.POST("/api/coding/:language/:testset", func(c *gin.Context) {
	//	var (
	//		language = coding.LoadLang(c.Param("language"))
	//		testset  = c.Param("testset")
	//	)
	//	if language == nil {
	//		c.AbortWithStatus(http.StatusBadRequest)
	//		return
	//	}
	//})
	// 수강목록 리턴
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
		if sess.(*Session).Auth.Level >= level {
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
func course(c *gin.Context) {
	rows, err := db.Query(
		"SELECT c.code, c.name, c.description, u.code, u.name FROM `course` c INNER JOIN `user` u ON c.user_code = u.code WHERE c.code = ?",
		c.Param("course_id"),
	)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	if !rows.Next() {
		log.Println(err)
		c.AbortWithStatus(http.StatusNotFound)
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
	err = rows.Scan(&code, &name, &description, &instructorCode, &instructorName)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	result, _ = sjson.Set(result, "code", code)
	result, _ = sjson.Set(result, "name", name)
	result, _ = sjson.Set(result, "description", description)
	result, _ = sjson.Set(result, "instructor.code", instructorCode)
	result, _ = sjson.Set(result, "instructor.name", instructorName)
	c.Set("course", result)
}

func room(c *gin.Context) {
	var (
		courseId = c.Param("course_id")
		roomId   = c.Param("room_id")
	)
	rows, err := db.Query(
		"SELECT r.name, r.description, r.open_time, r.close_time, u.code, u.name FROM `room` r INNER JOIN `course` c ON r.course_code = c.code INNER JOIN `user` u ON c.user_code = u.code WHERE c.code = ?, r.code=?",
		courseId,
		roomId,
	)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	if !rows.Next() {
		log.Println(err)
		c.AbortWithStatus(http.StatusNotFound)
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
	err = rows.Scan(&name, &description, &open, &close, &instructorCode, &instructorName)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	result, _ = sjson.Set(result, "code", roomId)
	result, _ = sjson.Set(result, "name", name)
	result, _ = sjson.Set(result, "description", description)
	if open.Valid {
		result, _ = sjson.Set(result, "open_time", open.Time.Format(time.RFC3339))
	}
	if close.Valid {
		result, _ = sjson.Set(result, "close_time", close.Time.Format(time.RFC3339))
	}
	result, _ = sjson.Set(result, "course.code", courseId)
	result, _ = sjson.Set(result, "instructor.code", instructorCode)
	result, _ = sjson.Set(result, "instructor.name", instructorName)
	c.Set("room", result)
}
func pkg(c *gin.Context) {
	var (
		packageId = c.Param("package_id")
	)
	rows, err := db.Query(
		"SELECT name, description FROM package WHERE code=?",
		packageId,
	)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	if !rows.Next() {
		log.Println(err)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	var (
		name   string
		desc   string
		result = "{}"
	)
	err = rows.Scan(&name, &desc)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	result, _ = sjson.Set(result, "code", packageId)
	result, _ = sjson.Set(result, "name", name)
	result, _ = sjson.Set(result, "description", desc)
	c.Set("package", result)
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
