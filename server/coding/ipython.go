package coding

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/Masterminds/semver"
	"github.com/tidwall/gjson"
	"io"
	"io/ioutil"
	"os/exec"
	"strconv"
	"strings"
)

type Python struct {
	path    string
	version *semver.Version
}

type PythonInstance struct {
	src    []byte
	method string
	params []Type
	ret    Type
	p      *Python
}

func pyparam(values []Value) string {
	tmp := make([]string, len(values))
	for i, value := range values {
		tmp[i] = pyval(value)
	}
	return strings.Join(tmp, ", ")
}
func pyval(value Value) string {
	switch v := value.(type) {
	case I32Value:
		return strconv.FormatInt(int64(v), 10)
	case I64Value:
		return strconv.FormatInt(int64(v), 10)
	case F32Value:
		return strconv.FormatFloat(float64(v), 'f', -1, 32)
	case F64Value:
		return strconv.FormatFloat(float64(v), 'f', -1, 64)
	case StringValue:
		bts, _ := json.Marshal(v)
		return string(bts)
	case *ArrayValue:
		var builder strings.Builder
		builder.WriteString("[")
		for i, v2 := range v.raw {
			if i == 0 {
				builder.WriteString(pyval(v2))
			} else {
				builder.WriteString(", ")
				builder.WriteString(pyval(v2))
			}
		}
		builder.WriteString("]")
		return builder.String()
	default:
		panic("unreachable")
	}
}
func pystr(t Type, value string) Value {
	switch tt := t.(type) {
	case PrimitiveType:
		switch tt {
		case PrimI32:
			i, err := strconv.ParseInt(value, 10, 32)
			if err == nil {
				return I32Value(i)
			}
		case PrimI64:
			i, err := strconv.ParseInt(value, 10, 64)
			if err == nil {
				return I64Value(i)
			}
		case PrimF32:
			i, err := strconv.ParseFloat(value, 32)
			if err == nil {
				return F32Value(i)
			}
		case PrimF64:
			i, err := strconv.ParseFloat(value, 64)
			if err == nil {
				return F64Value(i)
			}
		case PrimString:
			if gjson.Valid(value) {
				tmp := gjson.Parse(value)
				if tmp.Type == gjson.String {
					return StringValue(tmp.String())
				}
			}
		}
	case *ArrayType:
		if gjson.Valid(value) {
			tmp := gjson.Parse(value)
			if tmp.IsArray() {
				arr := tmp.Array()
				res := make([]Value, len(arr))
				for i, e := range arr {
					res[i] = pystr(tt.ElemType, e.Raw)
					if res[i] == nil {
						return nil
					}
				}
				return &ArrayValue{
					ArrayType: tt,
					raw:       res,
				}
			}
		}
	}
	return nil
}

func NewPython(path string) (*Python, error) {
	out, err := exec.Command(path, "--version").Output()
	if err != nil {
		return nil, err
	}
	fmt.Println(strings.TrimSpace(strings.TrimPrefix(string(out), "Python ")))
	v, err := semver.NewVersion(strings.TrimSpace(strings.TrimPrefix(string(out), "Python ")))
	if err != nil {
		return nil, err
	}
	return &Python{
		path:    path,
		version: v,
	}, nil
}
func MustPython(path string) *Python {
	p, err := NewPython(path)
	if err != nil {
		panic(err)
	}
	return p
}

func (s *Python) Name() string {
	return PYTHON
}
func (s *Python) Version() *semver.Version {
	return s.version
}
func (s *Python) Build(src io.Reader, method string, params []Type, ret Type) (Instance, error) {
	srcbts, err := ioutil.ReadAll(src)
	if err != nil {
		return nil, err
	}
	return &PythonInstance{
		src:    srcbts,
		method: method,
		params: params,
		ret:    ret,
		p:      s,
	}, nil
}

func (s *PythonInstance) Valid(params []Value) error {
	if len(s.params) != len(params) {
		return errors.New("params length not valid")
	}
	for i := 0; i < len(s.params); i++ {
		if !s.params[i].EqualType(params[i].Type()) {
			return errors.New(fmt.Sprintf("type unmatched at %d", i))
		}
	}
	return nil
}
func (s *PythonInstance) Run(params []Value) (Value, error) {
	if err := s.Valid(params); err != nil{
		return nil, err
	}
	//
	cmd := exec.Command(s.p.path)
	// 프로세스 시작
	inbuf := bytes.NewBuffer(append(s.src, []byte(fmt.Sprintf("\n\nprint(%s(%s), end='')\n", s.method, pyparam(params)))...))
	outbuf := bytes.NewBuffer(nil)
	// stdin
	cmd.Stdin = inbuf
	cmd.Stdout = outbuf
	cmd.Stderr = outbuf
	err := cmd.Run()
	if err != nil {
		return nil, err
	}
	ret := pystr(s.ret, outbuf.String())
	return ret, nil
}

func (s *PythonInstance) Close() (err error) {
	return nil
}
