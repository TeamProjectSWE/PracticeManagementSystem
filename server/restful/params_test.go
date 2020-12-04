package restful

import (
	"fmt"
	"github.com/go-playground/validator/v10"
	"testing"
	"time"
)

func TestValidate(t *testing.T) {
	v := validator.New()
	t.Run("APIPostRoom:Code", func(t *testing.T) {
		if err := v.Struct(
			APIPostRoom{
				Code:        "",
				Name:        "이름",
				Description: "설명",
				OpenTime:    time.Now(),
				CloseTime:   time.Now().Add(2 * time.Hour),
			},
		); err == nil {
			t.Fatal("expected fail required")
		}else{
		}
		if err := v.Struct(
			APIPostRoom{
				Code:        "코드",
				Name:        "이름",
				Description: "설명",
				OpenTime:    time.Now(),
				CloseTime:   time.Now().Add(2 * time.Hour),
			},
		); err == nil {
			t.Fatal("expected fail alphanum")
		}
		if err := v.Struct(
			APIPostRoom{
				Code:        "CSE00000000",
				Name:        "이름",
				Description: "설명",
				OpenTime:    time.Now(),
				CloseTime:   time.Now().Add(2 * time.Hour),
			},
		); err == nil {
			t.Fatal("expected fail lte=10")
		}
	})
	t.Run("APIPostRoom:Name", func(t *testing.T) {
		if err := v.Struct(
			APIPostRoom{
				Code:        "CSE0000000",
				Name:        "",
				Description: "설명",
				OpenTime:    time.Now(),
				CloseTime:   time.Now().Add(2 * time.Hour),
			},
		); err == nil {
			t.Fatal("expected fail required")
		}
	})
	t.Run("APIPostRoom:Time", func(t *testing.T) {
		if err := v.Struct(
			APIPostRoom{
				Code:        "CSE0000000",
				Name:        "이름",
				Description: "설명",
				CloseTime:   time.Now().Add(2 * time.Hour),
			},
		); err == nil {
			t.Fatal("expected fail time open.required")
		}else{
			fmt.Println(err)
		}
		if err := v.Struct(
			APIPostRoom{
				Code:        "CSE0000000",
				Name:        "이름",
				Description: "설명",
				OpenTime:   time.Now(),
			},
		); err == nil {
			t.Fatal("expected fail time close.required")
		}else{
			fmt.Println(err)
		}
		if err := v.Struct(
			APIPostRoom{
				Code:        "CSE0000000",
				Name:        "이름",
				Description: "설명",
				OpenTime:    time.Now(),
				CloseTime:   time.Now().Add(-(2 * time.Hour)),
			},
		); err == nil {
			t.Fatal("expected fail time close.gtefield=OpenTime")
		}
	})
}
