import React,{useState} from 'react';
import Paper from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
    loginWrap: {
        margin: 'auto',
        width: 400,
        height: 300,
        marginTop: 150
    },
    loginForm: {
        width: 400,
    },
    textField: {
        width: 400,
        margin: theme.spacing(2)

    },
    loginButton: {
        width: 400,
        margin: theme.spacing(2)
    }
})

const Login = ({classes,handleLogin})=>{
    const [email, setEmail] = useState('');
    const onChangeEmail = (e)=>{
        setEmail(e.target.value);
    }
    const onLogin  = ()=>{
        if(email === ''){
            alert('이름을 입력해주세요');
            return;
        }

        if(handleLogin(email)){
            alert('환영합니다!');
        }else{
            alert('오류 발생!');
        }
    }
    const handleKeyPress = (e)=>{
        if(e.charCode === 13){
            onLogin();
        }
    }
    return (
        <Paper className={classes.loginWrap} elevation={3}>
            <span>시작하기</span>
            <form className={classes.loginForm}>
                <TextField
                    className={classes.textField}
                    id="email-text"
                    label="닉네임"
                    variant="outlined"
                    value={email}
                    name='email'
                    onChange={onChangeEmail}
                    onKeyPress={handleKeyPress}
                    required={true}
                />
                <Button 
                    className={classes.loginButton} 
                    variant="contained" color="primary" 
                    onClick={onLogin}
                >접속하기!</Button>
            </form>
        </Paper>
    )
}


export default withStyles(styles)(Login);