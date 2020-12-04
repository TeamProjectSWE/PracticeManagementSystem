package coding

import (
	"encoding/json"
	"github.com/Masterminds/semver"
	"io"
)

const (
	C      = "c"
	JAVA   = "JAVA"
	PYTHON = "python"
)

var _langs = map[string]Language{}

func SetupLang(name string, lang Language) {
	if lang == nil {
		return
	}
	_langs[name] = lang
}
func LoadLang(name string) Language {
	return _langs[name]
}

type Language interface {
	Name() string
	Version() *semver.Version
	Build(src io.Reader, method string, params []Type, ret Type) (Instance, error)
	Signature(method string, params []Type, ret Type, names []string) string
}
type Instance interface {
	Valid(params []Value) error
	Run(params []Value) (Value, error)
	io.Closer
}

type Type interface {
	IsPrimitive() bool
	IsArray() bool
	IsMap() bool
	EqualType(b Type) bool
}

const (
	PrimI32    PrimitiveType = iota
	PrimI64    PrimitiveType = iota
	PrimF32    PrimitiveType = iota
	PrimF64    PrimitiveType = iota
	PrimString PrimitiveType = iota
)

type (
	PrimitiveType uint8
	ArrayType     struct {
		Size     []int
		ElemType Type
	}
	//Map struct {
	//	Key   PrimitiveType
	//	Value Type
	//}
)

func (PrimitiveType) IsPrimitive() bool {
	return true
}
func (PrimitiveType) IsArray() bool {
	return false
}
func (PrimitiveType) IsMap() bool {
	return false
}
func (s PrimitiveType) EqualType(b Type) bool {
	if pb, ok := b.(PrimitiveType); ok {
		return s == pb
	}
	return false
}
func (*ArrayType) IsPrimitive() bool {
	return false
}
func (*ArrayType) IsArray() bool {
	return true
}
func (*ArrayType) IsMap() bool {
	return false
}
func (s *ArrayType) EqualType(b Type) bool {
	if ab, ok := b.(*ArrayType); ok {
		if len(s.Size) != len(ab.Size) {
			return false
		}
		for i := 0; i < len(s.Size); i++ {
			if s.Size[i] != ab.Size[i] {
				return false
			}
		}
		return s.ElemType.EqualType(ab.ElemType)
	}
	return false
}

// PrimitiveType => 일치하는 go의 원시 자료형
// ArrayType =>
type Value interface {
	json.Marshaler
	Type() Type
	EqualValue(v Value) bool
}

type (
	I32Value    int32
	I64Value    int64
	F32Value    float32
	F64Value    float64
	StringValue string
	ArrayValue  struct {
		ArrayType *ArrayType
		raw       []Value
	}
	//MapValue struct {
	//	KeyType PrimitiveType
	//	ValueType Type
	//	raw map[Value]Value
	//}
)

func (s I32Value) MarshalJSON() ([]byte, error) { return json.Marshal(int32(s)) }

func (I32Value) Type() Type {
	return PrimI32
}

func (s I32Value) EqualValue(v Value) bool {

	return s.Type().EqualType(v.Type()) && s == v.(I32Value)
}

func (s I64Value) MarshalJSON() ([]byte, error) { return json.Marshal(int64(s)) }
func (I64Value) Type() Type {
	return PrimI64
}
func (s I64Value) EqualValue(v Value) bool {
	return s.Type().EqualType(v.Type()) && s == v.(I64Value)
}

func (s F32Value) MarshalJSON() ([]byte, error) { return json.Marshal(float32(s)) }
func (F32Value) Type() Type {
	return PrimF32
}
func (s F32Value) EqualValue(v Value) bool {
	return s.Type().EqualType(v.Type()) && s == v.(F32Value)
}

func (s F64Value) MarshalJSON() ([]byte, error) { return json.Marshal(float64(s)) }
func (F64Value) Type() Type {
	return PrimF64
}
func (s F64Value) EqualValue(v Value) bool {
	return s.Type().EqualType(v.Type()) && s == v.(F64Value)
}
func (s StringValue) MarshalJSON() ([]byte, error) { return json.Marshal(string(s)) }
func (StringValue) Type() Type {
	return PrimString
}
func (s StringValue) EqualValue(v Value) bool {
	return s.Type().EqualType(v.Type()) && s == v.(StringValue)
}

func (s *ArrayValue) MarshalJSON() ([]byte, error) { return json.Marshal(s.raw) }
func (s *ArrayValue) Type() Type {
	return s.ArrayType
}
func (s *ArrayValue) EqualValue(v Value) bool {
	return s.Type().EqualType(v.Type()) && s == v.(*ArrayValue)
}

type Shape struct {
	types []Type
}
