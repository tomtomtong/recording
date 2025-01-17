import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import MicNoneIcon from "@mui/icons-material/MicNone";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useEffect, useRef, useState } from "react";
import {
    fetchMainVideos,
    fetchReplayVideo,
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
    const [recordingStarted, setRecordingStarted] = useState(false);
    const [audio, setAudio] = useState(null);
    const [timer, setTimer] = useState(120);
    const [userData, setUserData] = useState(null);
    const [pauseVisible, setPauseVisible] = useState(true);
    const [replayVideo, setReplayVideo] = useState(null);
    const [playVideoIndex, setPlayVideoIndex] = useState(0);

    const router = useRouter();

    const timerInterval = useRef();

    const videoRef = useRef();
    const isRecording = useRef(false);

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
        if (videos[playVideoIndex]?.name == 'Ending') {
            setPauseVisible(true);
            return videoRef.current.pause();
        }
        const isEven = videoIndex != 0 && videoIndex % 2 == 0;

        if ((videoIndex + 1) % 2 == 0) {
            setPauseVisible(false);
        } else {
            setPauseVisible(true);
        }
        if (isEven && !recordingStarted && timer > 0) {
            setPauseVisible(false);
            return videoRef.current.play();
        }
        if (isRecording.current && isEven && timer > 0) {
            setPauseVisible(false);
            return videoRef.current.play();
        }

        setRecordingStarted(false);
        isRecording.current = false;
        clearInterval(timerInterval.current);
        setTimer(120);
        setIsPaused(false);
        setVideoIndex((prevState) => prevState + 1);
        if (!isEven) {
            setPlayVideoIndex(prevState => prevState + 1);
        }
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
        if (isRecording.current) {
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
            isRecording.current = false;
            videoFinished();
        } else {
            Mp3Recorder.start();
            timerInterval.current = setInterval(() => {
                setTimer((prevState) => prevState - 1);
            }, 1000);
            setRecordingStarted(true);
            isRecording.current = true;
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
        isRecording.current = false;
        setTimer(120)
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

                if (response.status == 200) {
                    setUserData(response.data);
                    setReplayVideo(response.data.replay);
                }
            } catch {
                router.push("/login");
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (videos.length > 0) {
            if (videos[playVideoIndex]?.name == 'Ending') {
                setCurrentVideo(videos[playVideoIndex]);
                return videoRef.current.play();
            }
            if (videoIndex != 0 && videoIndex % 2 == 0) {
                setCurrentVideo(replayVideo);
            } else {
                setCurrentVideo(videos[playVideoIndex]);
            }
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
                        let sortedVideos = userVideos.sort((previous, current) => previous.name.split(".")[0] - current.name.split(".")[0]);
                        cloneState = [openingVideo, ...sortedVideos, endingVideo];
                        return cloneState;
                    });
                };

                getUserVideos();
            }
        }
    }, [videos, playVideoIndex, videoIndex]);

    return (
        <div>
            <video
                ref={videoRef}
                playsInline
                autoPlay
                key={videoIndex}
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
            {!pauseVisible && (
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
                            border: isRecording.current ? "7px solid red" : "7px solid black",
                            color: isRecording.current ? "red" : "black",
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
            {pauseVisible && (
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
