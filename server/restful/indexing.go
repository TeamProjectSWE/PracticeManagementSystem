package restful

import (
	"errors"
	"math"
	"strconv"
	"strings"
)

func ParseIndexing(s string) (result [2]uint64, err error) {
	if len(s) == 0 {
		return [2]uint64{}, errors.New("no expression")
	}
	var tmp = strings.SplitN(s, "~", 2)
	var st, sterr = strconv.ParseUint(tmp[0], 10, 64)
	if len(tmp) == 2 {
		if len(tmp[0]) > 0 && sterr != nil {
			return [2]uint64{}, sterr
		}
		var ed, ederr = strconv.ParseUint(tmp[1], 10, 64)
		if ederr != nil {
			if len(tmp[1]) != 0 {
				return [2]uint64{}, ederr
			}
			ed = math.MaxUint64
		}
		if st > ed {
			return [2]uint64{}, errors.New("start larger than end")
		}
		if st == ed {
			return [2]uint64{}, errors.New("start equal end")
		}
		return [2]uint64{st, ed}, nil
	}
	if sterr != nil {
		return [2]uint64{}, sterr
	}
	return [2]uint64{st, st + 1}, nil

}
