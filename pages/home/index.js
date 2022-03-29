import { Paper } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FileUpload from "../../components/FileUpload/FileUpload";
import Axios from "axios";

export default function HomePage() {
  const [userData, setUserData] = useState(null);
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
            <video width="320" height="240" controls >
              <source src={`${process.env.NEXT_PUBLIC_API_URL}${userData.Video[0].url}`} />
            </video>
          </Paper>
        )}
        <FileUpload data={userData} />
      </Paper>
    </div>
  );
}
