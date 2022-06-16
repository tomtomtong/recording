import { Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import Axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // const [isEmailValid, setIsEmailValid] = useState(true);
  // const [isPasswordValid, setIsPasswordValid] = useState(true);

  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    setError("");
    const data = { identifier: email, password };
    try {
      const response = await Axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
        data
      );
      if (response.status === 200) {
        localStorage.setItem("token", response.data.jwt);
        router.push("/video");
      }
    } catch {
      //Show error
      setError("Invalid password or email");
    }
  };

  // const validateEmail = (userInput) => {
  //   setEmail(userInput);
  //   const isValid =
  //     /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
  //       userInput
  //     );
  //   console.log(isValid, "email")
  //   if (!isValid) {
  //     setIsEmailValid(false);
  //   } else {
  //     setIsEmailValid(true);
  //   }
  // };

  // const validatePassword = (userInput) => {
  //   setPassword(userInput);
  //   const isValid = userInput.length >= 6;
  //   console.log(isValid, "password")
  //   if (isValid) setIsPasswordValid(true);
  //   else setIsPasswordValid(false);
  // };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ width: "500px", padding: "40px 80px" }}>
        <form
          onSubmit={login}
          style={{ display: "flex", flexDirection: "column", gap: "40px" }}
        >
          <Typography variant="h3" textAlign={"center"}>
            Login
          </Typography>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            label="Email"
            type="email"
          />
          {/* {!isEmailValid && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              Email isn't valid.
            </Typography>
          )} */}
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            label="Password"
            type="password"
          />
          {/* {!isPasswordValid && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              Password must contain atleast six characters.
            </Typography>
          )} */}
          {error && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{ width: "150px", margin: "0 auto" }}
            disabled={!(email.length > 0 && password.length > 0)}
            type="submit"
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </div>
  );
}
