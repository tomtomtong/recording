import { Paper } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Recorder from "../../components/FileUpload/Recorder";
import { Button, Paper, Typography } from "@mui/material";
// import FileUpload from "../../components/FileUpload/FileUpload";
import * as styles from "./FileUpload.module.css";
import Axios from "axios";

export default function HomePage() {
  const [userData, setUserData] = useState(null);
  const [audio, setAudio] = useState(null);
  const [currentAudio, setCurrentAudio] = useState();
  const [fetchedAudios, setFetchedAudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState();
  const [isRecordingStart, setIsRecordingStart] = useState(false);
  const [interval, setInterval] = useState();
  const router = useRouter();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) router.push("/login");

    const fetchUserData = async () => {
      try {
        const response = await Axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=video`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          let data = response.data;
          console.log(data);
          setUserData(data);
        }
      } catch {
        router.push("/login");
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("files", audio);
    data.append("refId", "1");
    data.append("ref", "plugin::users-permissions.user");
    data.append("field", "cover");
    let token = localStorage.getItem("token");
    if (!token) router.push("/login");

    const response = await Axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      alert("File uploaded successfully");
    } else {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  useEffect(() => {
    const fetchAudiosList = async () => {
      const response = await Axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recordings?populate=audio`
      );
      if (response.status !== 200) router.push("/login")
      if (response.status === 200) {
        let femaleList = [];
        let maleList = [];
        let audios = response.data.data;
        console.log(response)
        for (let i = 0; i < audios.length; i++) {
          if (audios[i].attributes.gender === "male") {
            for (let g = 0; g < audios[i].attributes.audio.data.length; g++) {
              maleList.push(audios[i].attributes.audio.data[g]);
            }
          } else if (audios[i].attributes.gender === "female") {
            for (let k = 0; k < audios[i].attributes.audio.data.length; k++) {
              femaleList.push(audios[i].attributes.audio.data[k]);
            }
          }
        }
        if (userData?.gender === "male") {
          setFetchedAudios(maleList);
          setCurrentAudio(maleList[0]);
        }
        if (userData?.gender === "female") {
          setFetchedAudios(femaleList);
          setCurrentAudio(femaleList[0]);
        }
        setCurrentIndex(0);
      }
    };
    fetchAudiosList();
  }, []);

  useEffect(() => {
    if (fetchedAudios.length > 0 && !isRecordingStart) {
      setInterval(
        setTimeout(() => {
          setCurrentAudio(fetchedAudios[currentIndex + 1]);
          setCurrentIndex((prevState) => prevState + 1);
        }, 60000)
      );
    } else {
      clearTimeout(interval);
    }
  }, [fetchedAudios, isRecordingStart]);



  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Paper
        sx={{
          display: "grid",
          gridTemplateColumns: userData?.Video ? "1fr 1fr" : "1fr",
          margin: "0 auto",
        }}
      >
        {userData?.Video && (
          <Paper
            sx={{
              padding: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <video width="320" height="240" controls>
              <source
                src={`${process.env.NEXT_PUBLIC_API_URL}${userData.Video[0].url}`}
              />
            </video>
          </Paper>
        )}
        <div className={styles.fileUpload}>
          <Paper
            sx={{
              padding: "20px 80px",
              backgroundColor: "#e3e3e3",
              display: "flex",
              width: "100%",
              flexDirection: "column",
            }}
          >
            <Typography textAlign="center" variant="h4">
              Servers audio
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Playing gender {userData?.gender}
            </Typography>
            <br />
            {fetchedAudios.length > 0 && (
              <audio
                controls="controls"
                src={`${process.env.NEXT_PUBLIC_API_URL}${currentAudio?.attributes?.url}`}
              />
            )}
          </Paper>
          <Paper sx={{ padding: "10px 80px" }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <Typography textAlign="center">User Audio</Typography>
              <Recorder
                setAudio={setAudio}
                setIsRecordingStart={setIsRecordingStart}
              />
              <Button type="submit" variant="outlined">
                Submit
              </Button>
            </form>
          </Paper>
        </div>
      </Paper>
    </div>
  );
}
