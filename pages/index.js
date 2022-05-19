import styles from "../styles/Home.module.css";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  ImageList,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import Question from "../components/question/question";
import { styled } from "@mui/material/styles";
import Axios from "axios";
import { ImageUpload } from "../components/ImageUpload/ImageUpload";

const Input = styled("input")({
  display: "none",
});

export default function Home() {
  const [steps, setSteps] = useState(true);
  const [slide, setSlide] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isQuestionsFinished, setIsQuestionsFinished] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [imageOne, setImageOne] = useState(null);
  const [imageOnePreview, setImageOnePreview] = useState(null);
  const [imageTwo, setImageTwo] = useState(null);
  const [imageTwoPreview, setImageTwoPreview] = useState(null);

  const validateEmail = (userInput) => {
    setEmail(userInput);
    const isValid =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
        userInput
      );

    if (!isValid) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const validatePassword = (userInput) => {
    setPassword(userInput);
    const isValid = userInput.length >= 6;

    if (isValid) setIsPasswordValid(true);
    else setIsPasswordValid(false);
  };

  const validatePhoneNumber = (userInput) => {
    setPhoneNumber(userInput);
    const isValid = phoneNumber.length >= 8;

    isValid ? setIsPhoneNumberValid(true) : setIsPhoneNumberValid(false);
  }

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

  const handleSignup = () => {
    let isUsernameValid = username.length > 0;
    let isPasswordValid = password.length > 0;
    let isGenderValid = gender.length > 0;
    let isPhoneNumberValid = phoneNumber.length >= 8;
    if (
      !isUsernameValid ||
      !isPasswordValid ||
      !isGenderValid ||
      !isPhoneNumberValid
    ) {
      alert("All fields are required");
      return;
    }
    setSlide(true);
    setTimeout(() => {
      setSteps(false);
      setSlide(false);
    }, 800);
  };

  useEffect(async () => {
    if (isQuestionsFinished) {
      let userData = {
        username,
        password,
        email,
        questions: userAnswers,
        gender,
        phoneNumber,
      };
      const response = await Axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`,
        { ...userData }
      );

      const token = response.data.jwt;
      const userId = response.data.user.id;

      const data = new FormData();

      if (imageOne) data.append("files", imageOne);
      if (imageTwo) data.append("files", imageTwo);
      data.append("refId", userId);
      data.append("ref", "plugin::users-permissions.user");
      data.append("field", "image");

      await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }, [isQuestionsFinished]);

  if (isQuestionsFinished) {
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
        <div>
          <TextField
            fullWidth
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            variant="outlined"
            label="Email"
          />
          {!isEmailValid && (
            <Typography
              sx={{ color: "red", textAlign: "center", paddingTop: "5px" }}
            >
              Email is not valid.
            </Typography>
          )}
        </div>
        <div>
          <TextField
            fullWidth
            value={password}
            onChange={(e) => validatePassword(e.target.value)}
            variant="outlined"
            label="Password"
          />
          {!isPasswordValid && (
            <Typography
              sx={{ color: "red", textAlign: "center", paddingTop: "5px" }}
            >
              Password must be six characters long.
            </Typography>
          )}
        </div>

        <div>
          <TextField
            fullWidth
            value={phoneNumber}
            onChange={(e) => validatePhoneNumber(e.target.value)}
            variant="outlined"
            label="Phone Number"
          />
          {!isPhoneNumberValid && (
            <Typography
              sx={{ color: "red", textAlign: "center", paddingTop: "5px" }}
            >
              Phone number is invalid.
            </Typography>
          )}
        </div>
        <Typography textAlign="center" variant="h5">
          Add your photos
        </Typography>
        <div style={{ display: "flex", gap: "20px", margin: "0 auto" }}>
          <ImageUpload
            imagePreview={imageOnePreview}
            setImagePreview={setImageOnePreview}
            setImage={setImageOne}
            image={imageOne}
          />
          <ImageUpload
            imagePreview={imageTwoPreview}
            setImagePreview={setImageTwoPreview}
            setImage={setImageTwo}
            image={imageTwo}
          />
        </div>
        <FormControl
          sx={{
            flexDirection: "row",
            gap: "40px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FormLabel>Gender</FormLabel>
          <RadioGroup
            sx={{ flexDirection: "row" }}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
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
