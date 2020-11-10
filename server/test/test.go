package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("python")
	outbuf := bytes.NewBuffer(nil)
	cmd.Stdin = bytes.NewBuffer([]byte(`
def sum(a):
    result = 0
    for e in a:
        result += e
    return result

print(sum([1, 2, 3]))
`))
	cmd.Stdout = outbuf
	err := cmd.Run()
	fmt.Println(err)
	fmt.Println(outbuf.String())
}
