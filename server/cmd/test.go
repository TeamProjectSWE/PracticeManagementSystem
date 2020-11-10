package main

import "github.com/tidwall/gjson"

func splitArr(arr string) []string {
	parsed := gjson.Parse(arr)
	if !parsed.IsArray(){
		return nil
	}
	parr := parsed.Array()
	res := make([]string, len(parr))
	for i, elem := range parr {
		res[i] = elem.Raw
	}
	return res
}
func main() {
	src := "[[1, 2, 3]]"
	tmp := splitArr(src)
	println(tmp)
}
