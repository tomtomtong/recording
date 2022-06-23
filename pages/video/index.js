import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import MicNoneIcon from "@mui/icons-material/MicNone";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useEffect, useRef, useState } from "react";
import {
    fetchMainVideos,
    fetchUserVideos,
    sendRecording,
} from "../../apis/video";
import MicRecorder from "mic-recorder-to-mp3";
import { fetchUserDataVideos } from "../../apis/user";
import { useRouter } from "next/router";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

export default function VideoPage() {
    const [isPaused, setIsPaused] = useState(false);
    const [videoIndex, setVideoIndex] = useState(0);
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [hasFetchedUserVideos, setHasFetchedUserVideos] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStarted, setRecordingStarted] = useState(false);
    const [audio, setAudio] = useState(null);
    const [timer, setTimer] = useState(120);
    const [userData, setUserData] = useState(null);
    const router = useRouter();

    const timerInterval = useRef();

    const videoRef = useRef();

    const onClickPauseButton = () => {
        setIsPaused(true);
        videoRef.current.pause();
        clearInterval(timerInterval.current);
    };
    const onClickPlayButton = () => {
        setIsPaused(false);
        videoRef.current.play();

    };

    const videoFinished = () => {
        if (
            !recordingStarted &&
            videoIndex > 0 &&
            videoIndex < videos.length - 1 &&
            timer > 0
        ) {
            return videoRef.current.play();
        }
        setRecordingStarted(false);
        setIsRecording(false);
        clearInterval(timerInterval.current);
        setTimer(120);
        setIsPaused(false);
        setVideoIndex((prevState) => prevState + 1);
    };

    const extractVideoData = (data) => {
        const videos = [];

        for (let i = 0; i < data.length; i++) {
            const videoMetadata = {
                name: data[i].attributes.name,
                url: data[i].attributes.video.data.attributes.url,
            };
            videos.push(videoMetadata);
        }
        return videos;
    };

    const onClickRecording = () => {
        if (isRecording) {
            Mp3Recorder.stop()
                .getMp3()
                .then(([buffer, blob]) => {
                    const file = new File(buffer, "audio.mp3", {
                        type: blob.type,
                        lastModified: Date.now(),
                    });
                    setAudio(file);
                })
                .catch((e) => console.log(e));
            videoRef.current.pause();
            videoFinished();
        } else {
            Mp3Recorder.start();
            timerInterval.current = setInterval(() => {
                setTimer((prevState) => prevState - 1);
            }, 1000);
            setRecordingStarted(true);
            setIsRecording((prevState) => !prevState);
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();

        data.append("files", audio);
        data.append("refId", userData.id);
        data.append("ref", "plugin::users-permissions.user");
        data.append("field", "recording");

        let token = localStorage.getItem("token");
        if (!token) router.push("/login");

        const response = await sendRecording(data);
        if (response.status === 200) {
            alert("File uploaded successfully");
        }
    };

    const onClickRestartRecording = () => {
        Mp3Recorder.stop();
        setAudio(null);
        setIsRecording(false);
        setRecordingStarted(false);
    };

    useEffect(() => {
        if (audio) {
            handleSubmit();
        }
    }, [audio]);

    useEffect(() => {
        if (timer <= 0) {
            videoFinished();
        }
    }, [timer]);

    useEffect(() => {
        const getMainVideos = async () => {
            const response = await fetchMainVideos();
            const videos = extractVideoData(response.data.data);
            const openingVideoData = videos.filter(
                (currentVideo) => currentVideo.name == "Opening"
            );
            const endingVideoData = videos.filter(
                (currentVideo) => currentVideo.name == "Ending"
            );
            setVideos([openingVideoData[0], endingVideoData[0]]);
            setCurrentVideo(openingVideoData[0]);
        };
        getMainVideos();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetchUserDataVideos();
                console.log(response);
                if (response.status == 200) {
                    setUserData(response.data);
                }
            } catch {
                router.push("/login");
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (videos.length > 0) {
            setCurrentVideo(videos[videoIndex]);

            if (!hasFetchedUserVideos) {
                setHasFetchedUserVideos(true);
                const getUserVideos = async () => {
                    const response = await fetchUserVideos();
                    const userVideos = response.data.Video.map((currentVideo) => {
                        return { name: currentVideo.name, url: currentVideo.url };
                    });
                    setVideos((prevState) => {
                        let cloneState = [...prevState];
                        const openingVideo = cloneState[0];
                        const endingVideo = cloneState[1];
                        cloneState = [openingVideo, ...userVideos, endingVideo];
                        return cloneState;
                    });
                };

                getUserVideos();
            }
        }
    }, [videos, videoIndex]);

    return (
        <div>
            <video
                ref={videoRef}
                playsInline
                autoPlay
                key={videoIndex}
                muted
                onEnded={videoFinished}
                style={{
                    objectFit: "cover",
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    top: 0,
                    left: 0,
                }}
            >
                {videos?.length > 0 && (
                    <source
                        src={`${process.env.NEXT_PUBLIC_API_URL}${currentVideo?.url}`}
                        type="video/mp4"
                    />
                )}
            </video>
            {videoIndex != 0 && videoIndex != videos.length - 1 && (
                <>
                    <p
                        style={{
                            position: "absolute",
                            top: "10%",
                            left: "20%",
                            borderRadius: "50px",
                            height: "60px",
                            width: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            border: "7px solid black",
                        }}
                    >
                        {timer}
                    </p>
                    <MicNoneIcon
                        onClick={onClickRecording}
                        style={{
                            position: "absolute",
                            border: isRecording ? "7px solid red" : "7px solid black",
                            color: isRecording ? "red" : "black",
                            borderRadius: "50px",
                            fontSize: "4rem",
                            bottom: "11%",
                            left: "20%",
                        }}
                    />
                    <RestartAltIcon
                        onClick={onClickRestartRecording}
                        style={{
                            position: "absolute",
                            border: "7px solid black",
                            borderRadius: "50px",
                            fontSize: "4rem",
                            bottom: "11%",
                            left: "25%",
                        }}
                    />
                </>
            )}
            {!isRecording && (
                <>
                    {isPaused ? (
                        <PlayCircleOutlineIcon
                            style={{
                                position: "absolute",
                                fontSize: "5rem",
                                bottom: "10%",
                                left: "10%",
                            }}
                            onClick={onClickPlayButton}
                        />
                    ) : (
                        <PauseCircleOutlineIcon
                            style={{
                                position: "absolute",
                                fontSize: "5rem",
                                bottom: "10%",
                                left: "10%",
                            }}
                            onClick={onClickPauseButton}
                        />
                    )}
                </>
            )}
        </div>
    );
}
