import React, { useEffect, useState } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import * as styles from "./Recorder.module.css";
import { Button } from "@mui/material";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const Recorder = (props) => {
  const [isBlocked, setIsBlocked] = useState(null);
  const [blobURL, setBlobURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const start = () => {
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      props.setIsRecordingStart(true);
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  };

  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        console.log(buffer);
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        props.setAudio(file);
        // console.log(buffer + "\n" + blob);
        const blobURL = URL.createObjectURL(blob);
        setBlobURL(blobURL);
        setIsRecording(false);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    //   navigator.
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  }, []);

  return (
    <div className={styles.Recorder}>
      <header className={styles.header}>
        <Button
          variant="contained"
          type="button"
          onClick={start}
          disabled={isRecording}
        >
          Record
        </Button>
        <Button
          variant="contained"
          type="button"
          onClick={stop}
          disabled={!isRecording}
        >
          Stop
        </Button>
        <audio src={blobURL} controls="controls" />
      </header>
    </div>
  );
};


export default Recorder;
