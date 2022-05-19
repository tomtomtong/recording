import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { useEffect } from "react";

const Input = styled("input")({
    display: "none",
});

export const ImageUpload = (props) => {
    const { image, setImage, setImagePreview, imagePreview } = props;
    const addImageHandler = (file) => {
        setImage(file[0]);
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    }

    useEffect(() => {
        if (image) {
            setImagePreview(URL.createObjectURL(image));
        }
    }, [image]);

    return (
        <Stack style={{ alignItems: "center" }}>
            <label>
                <Input
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(e) => addImageHandler(e.target.files)}
                />
                <Button variant="contained" component="span">
                    Upload
                </Button>
            </label>
            <div style={{ position: "relative" }}>
                <img
                    style={{ maxWidth: "150px", maxHeight: "150px" }}
                    src={imagePreview}
                ></img>
                {image && <span onClick={removeImage}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "15px",
                        cursor: "pointer",
                    }}
                >
                    X
                </span>
                }
            </div>
        </Stack>
    );
};
