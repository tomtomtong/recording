import { useEffect, useState } from "react";
import styles from "./question.module.css";
import {
    Typography,
    Button,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";

const Question = (props) => {
    const [slide, setSlide] = useState(false);
    const [input, setInput] = useState(null);
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState([]);
    const [counter, setCounter] = useState(0);

    const onClickHandler = () => {
        setSlide(true);
        props.setUserAnswers((prevState) => {
            let cloneState = [
                ...prevState,
                {
                    question: props.questionData[counter].attributes.question,
                    answer: input,
                },
            ];
            return cloneState;
        });
        setCounter((prevState) => prevState + 1);
        setTimeout(() => {
            setInput(null);
            setSlide(false);
        }, 600);
    };

    useEffect(() => {
        if (props.questionData) {
            let firstQuestion = props.questionData[0].attributes;
            setOptions(firstQuestion.options);
            setTitle(firstQuestion.question);
        }
    }, []);

    useEffect(() => {
        if (counter === props.questionData.length) {
            props.finishQuestions(true);
            return;
        }

        if (counter > 0) {
            let nextQuestion = props.questionData[counter].attributes;
            console.log(nextQuestion);
            setTimeout(() => {
                setOptions(nextQuestion.options);
                setTitle(nextQuestion.question);
            }, 400);
        }
    }, [counter]);

    return (
        <div className={styles.container}>
            <form className={slide ? `${styles.slide} ${styles.form}` : styles.form}>
                <Typography variant="h4">{title}</Typography>
                <div className={styles.fieldsContainer}>
                    <FormControl>
                        <RadioGroup
                            defaultValue={null}
                            name="radio-buttons-group"
                            onChange={(e) => setInput(e.target.value)}
                        >
                            {options.length > 0 &&
                                options.map((curOption, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={curOption.option}
                                        label={curOption.option}
                                        control={<Radio />}
                                    />
                                ))}
                        </RadioGroup>
                    </FormControl>
                    <Button
                        onClick={onClickHandler}
                        variant="contained"
                        disabled={input === null}
                    >
                        OK
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Question;
