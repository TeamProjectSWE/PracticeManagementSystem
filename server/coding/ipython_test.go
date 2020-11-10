package coding

import (
	"bytes"
	"testing"
)

func TestPythonUtil(t *testing.T) {
	t.Run("pyval", func(t *testing.T) {
		if tmp := pyval(I32Value(1234)); tmp != "1234" {
			t.Fatal("i32")
		}
		if tmp := pyval(I64Value(4321)); tmp != "4321" {
			t.Fatal("i64")
		}
		if tmp := pyval(F32Value(12.34)); tmp != "12.34" {
			t.Fatal("f32")
		}
		if tmp := pyval(F64Value(43.21)); tmp != "43.21" {
			t.Fatal("f64")
		}
		if tmp := pyval(StringValue(`test"set`)); tmp != `"test\"set"` {
			t.Fatal("string")
		}
		if tmp := pyval(&ArrayValue{
			ArrayType: &ArrayType{
				ElemType: PrimI64,
				Size:     []int{-1},
			},
			raw: []Value{
				I64Value(1),
				I64Value(2),
				I64Value(3),
				I64Value(4),
			},
		}); tmp != `[1, 2, 3, 4]` {
			t.Fatal("array", tmp)
		}
	})
	t.Run("pystr", func(t *testing.T) {
		if tmp := pystr(PrimI64, "12"); tmp != nil {
			if tmpi64, ok := tmp.(I64Value); ok {
				if int64(tmpi64) != 12 {
					t.Fatal("I64Value is not valid", tmpi64)
				}
			} else {
				t.Fatal("cast I64Value fail", tmp)
			}
		} else {
			t.Fatal("i64 fail")
		}
	})
}
func TestPython(t *testing.T) {
	const TestSrc = `
def sum(a):
	result = 0
	for e in a:
		result += e
	return result`
	var arrtype = &ArrayType{
		Size:     []int{-1},
		ElemType: PrimI64,
	}
	var arrvalue = &ArrayValue{
		ArrayType: arrtype,
		raw: []Value{
			I64Value(1),
			I64Value(2),
			I64Value(3),
		},
	}
	t.Run("Python Instance", func(t *testing.T) {
		py := MustPython("python")
		pyi, err := py.Build(
			bytes.NewBuffer([]byte(TestSrc)),
			"sum",
			[]Type{arrtype},
			PrimI64,
		)
		if err != nil {
			t.Fatal(err)
			return
		}
		res, err := pyi.Run([]Value{arrvalue})
		if err != nil {
			t.Fatal(err)
			return
		}
		if resi64, ok := res.(I64Value); ok {
			if int64(resi64) != 6 {
				t.Fail()
				return
			}
		} else {
			t.Fail()
			return
		}
	})
}
