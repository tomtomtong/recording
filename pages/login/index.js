import { Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import Axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        router.push("/home");
      }
    } catch {
      //Show error
      setError("Invalid password or email")
      
    }
  };

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
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            label="Password"
            type="password"
          />
          {error && <Typography sx={{color:"red", textAlign:"center"}}>{error}</Typography>}
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
