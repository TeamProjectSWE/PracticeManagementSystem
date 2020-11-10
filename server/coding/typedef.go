package coding

import (
	"github.com/tidwall/gjson"
	"strconv"
	"strings"
)

func ParseType(src string) Type {
	switch src {
	case "i32":
		return PrimI32
	case "i64":
		return PrimI64
	case "f32":
		return PrimF32
	case "f64":
		return PrimF64
	case "str":
		return PrimString
	default:
		if strings.HasPrefix(src, "[") {
			indexend := strings.Index(src, "]")
			arrtype := new(ArrayType)
			sizearr := strings.Split(src[1:indexend], ",")
			arrtype.Size = make([]int, len(sizearr))
			for i, s := range sizearr {
				s = strings.TrimSpace(s)
				if len(s) == 0 {
					arrtype.Size[i] = -1
					continue
				}
				var err error
				arrtype.Size[i], err = strconv.Atoi(s)
				if err != nil {
					return nil
				}
			}
			arrtype.ElemType = ParseType(src[indexend+1:])
			if arrtype.ElemType == nil {
				return nil
			}
			return arrtype
		}
	}
	return nil
}
func ParseTypes(srcs ...string) []Type {
	parsedParams := make([]Type, len(srcs))
	for i, src := range srcs {
		parsedParams[i] = ParseType(src)
		if parsedParams[i] == nil {
			return nil
		}
	}
	return parsedParams
}
func ParseValue(t Type, src string) Value {
	switch tt := t.(type) {
	case PrimitiveType:
		switch tt {
		case PrimI32:
			i, err := strconv.ParseInt(src, 10, 32)
			if err == nil {
				return I32Value(i)
			}
		case PrimI64:
			i, err := strconv.ParseInt(src, 10, 64)
			if err == nil {
				return I64Value(i)
			}
		case PrimF32:
			i, err := strconv.ParseFloat(src, 32)
			if err == nil {
				return F32Value(i)
			}
		case PrimF64:
			i, err := strconv.ParseFloat(src, 64)
			if err == nil {
				return F64Value(i)
			}
		case PrimString:
			if gjson.Valid(src) {
				tmp := gjson.Parse(src)
				if tmp.Type == gjson.String {
					return StringValue(tmp.String())
				}
			}
		}
	case *ArrayType:
		if gjson.Valid(src) {
			tmp := gjson.Parse(src)
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

func ParseValues(t []Type, srcs ...string) []Value {
	if len(t) != len(srcs) {
		return nil
	}
	parsedParams := make([]Value, len(srcs))
	for i, src := range srcs {
		parsedParams[i] = ParseValue(t[i], src)
		if parsedParams[i] == nil {
			return nil
		}
	}
	return parsedParams

}
