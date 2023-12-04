import React, { useState } from "react";
import InputEmoji from "react-input-emoji";

export const InputWithEmoji = ({  }) => {
    const [text, setText] = useState("");

    function handleOnEnter(text) {
    }

    return (
        <InputEmoji
            value={text}
            onChange={setText}
            cleanOnEnter
            onEnter={handleOnEnter}
            placeholder="Type a message"
            // ref={ref}
        />
    );
}