package restful

type (
	Result struct {
		Success interface{}  `json:"success,omitempty"`
		Fail    *FailureData `json:"fail,omitempty"`
	}
	FailureData struct {
		RawError string `json:"causes"`
		Message  string `json:"message"`
	}
)

func Success(dat interface{}) Result {
	if dat == nil{
		dat = struct {}{}
	}
	return Result{
		Success: dat,
	}
}

func Fail(message string, rawError error) Result {
	var re = ""
	if rawError != nil {
		re = rawError.Error()
	}
	return Result{
		Fail: &FailureData{
			RawError: re,
			Message:  message,
		},
	}
}
