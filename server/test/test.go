package main

import (
	"database/sql"
	"fmt"
	"github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open(
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
		panic(err)
	}
	defer db.Close()
	rows, err := db.Query(`
SELECT name, description, restriction, (SELECT tag FROM tag WHERE problem_code=code) FROM problem`)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		var (
			name string
			desc string
			rest string
			tags string
		)
		err := rows.Scan(&name, &desc, &rest, &tags)
		if err != nil {
			panic(err)
		}
		fmt.Println(rows.Columns())
		tps, _ := rows.ColumnTypes()
		fmt.Println(tps[3].Name())
		fmt.Println(tps[3].DatabaseTypeName())
		fmt.Println(tps[3].DecimalSize())
		fmt.Println(tps[3].Length())
		fmt.Println(tps[3].Nullable())
		fmt.Println(tps[3].ScanType())
		fmt.Println(name, desc, rest)
	}
}
