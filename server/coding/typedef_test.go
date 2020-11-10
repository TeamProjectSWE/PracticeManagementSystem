package coding

import (
	"testing"
)

func TestParseType(t *testing.T) {
	t.Run("ParseType", func(t *testing.T) {
		if ParseType("i32") != PrimI32 {
			t.Fatal("i32 fail")
		}
		if ParseType("i64") != PrimI64 {
			t.Fatal("i64 fail")
		}
		if ParseType("f32") != PrimF32 {
			t.Fatal("f32 fail")
		}
		if ParseType("f64") != PrimF64 {
			t.Fatal("f64 fail")
		}
		if ParseType("str") != PrimString {
			t.Fatal("str fail")
		}
		if arrt, ok := ParseType("[]i32").(*ArrayType); ok {
			if arrt.ElemType != PrimI32 {
				t.Fatal("arr elem type fail")
			}
			if len(arrt.Size) != 1 {
				t.Fatal("arr size fail")
			}
			if arrt.Size[0] != -1 {
				t.Fatal("arr size fail")
			}
		}
	})
	t.Run("ParseValue", func(t *testing.T) {
		v := ParseValue(&ArrayType{
			Size:     []int{-1},
			ElemType: PrimI64,
		}, "[1, 2, 3]")
		if va, ok := v.(*ArrayValue); ok {
			if len(va.raw) != 3 {
				t.Fatal("not length 3")
			}
			if va0, ok := va.raw[0].(I64Value); ok {
				if va0 != 1 {
					t.Fatal("va[0] != 1")
				}
			} else {
				t.Fatal("type(va[0]) != i64")
			}
			if va1, ok := va.raw[1].(I64Value); ok {
				if va1 != 2 {
					t.Fatal("va[1] != 2")
				}
			} else {
				t.Fatal("type(va[1]) != i64")
			}
			if va2, ok := va.raw[2].(I64Value); ok {
				if va2 != 3 {
					t.Fatal("va[2] != 3")
				}
			} else {
				t.Fatal("type(va[2]) != i64")
			}
		} else {
			t.Fatal("invalid result array type")
		}
	})
}
