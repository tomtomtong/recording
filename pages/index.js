import styles from "../styles/Home.module.css";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import Question from "../components/question/question";
export default function Home() {
  const [steps, setSteps] = useState(true);
  const [slide, setSlide] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gender, setGender] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isQuestionsFinished, setIsQuestionsFinished] = useState(false);

  useEffect(() => {
    const fetchQuestions = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`)
        .then(
          (res) => {
            return res.json();
          },
          (err) => {
            console.log(err);
          }
        )
        .then((questions) => {
          if (questions) {
            let questionsList = questions.data;
            setQuestions(questionsList);
          }
        });
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    console.log(questions);
  }, [questions]);

  const handleSignup = () => {
    let isUsernameValid = username.length > 0;
    let isPasswordValid = password.length > 0;
    let isGenderValid = gender.length > 0;
    if(!isUsernameValid || !isPasswordValid || !isGenderValid){
      alert("All fields are required");
      return;
    }
    setSlide(true);
    setTimeout(() => {
      setSteps(false);
      setSlide(false);
    }, 800);
  };

  useEffect(() => {
    if (isQuestionsFinished) {
      let userData = { username, password, email, questions: userAnswers, gender };
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }).then((res) => {
        console.log(res);
      });
    }
  }, [isQuestionsFinished]);

  if (isQuestionsFinished) {
    console.log(userAnswers, password, username);
    return (
      <div className={styles.finishedDiv}>
        <Paper
          sx={{
            padding: "50px 100px",
          }}
        >
          <Typography variant="h4">Signed up successfully</Typography>
        </Paper>
      </div>
    );
  }

  if (!steps) {
    return (
      <Question
        questionData={questions}
        setUserAnswers={setUserAnswers}
        finishQuestions={setIsQuestionsFinished}
      />
    );
  }

  return (
    <div className={styles.container}>
      <form className={slide ? `${styles.slide} ${styles.form}` : styles.form}>
        <Typography className={styles.title} variant="h3">
          Sign Up Form
        </Typography>
        <TextField
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          label="Username"
        />
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          label="Email"
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          label="Password"
        />
        <FormControl sx={{flexDirection:'row', gap:'40px', alignItems:'center', justifyContent:"center"}}>
          <FormLabel>Gender</FormLabel>
          <RadioGroup
          sx={{flexDirection:"row"}}
            value={gender}
            onChange={(e)=>setGender(e.target.value)}
            name="radio-buttons-group"
          >
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel value="male" control={<Radio />} label="Male" />
          </RadioGroup>
        </FormControl>
        <Button onClick={handleSignup} variant="contained">
          Sign Up
        </Button>
      </form>
    </div>
  );
}
