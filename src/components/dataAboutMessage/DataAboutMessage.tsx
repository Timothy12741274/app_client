import {Message} from "@/components/message/Message";

export const DataAboutMessage = ({ selectedInfoMessage, setSelectedInfoMessage, messageToAnswer, username, setIsAnswerModeCallback}) => {
    return <div>
        <div>
            <span onClick={() => selectedInfoMessage({})}>Cancel</span>
            <span>Data about message</span>
        </div>
        <div>
            <Message
                setSelectedInfoMessage={setSelectedInfoMessage}
                messageToAnswer={messageToAnswer}
                username={username}
                m={selectedInfoMessage}
                setIsAnswerModeCallback={setIsAnswerModeCallback}
            />
        </div>
        <div style={{"paddingTop": "5px", "background": "gray"}}>
            {selectedInfoMessage.read && <div>
                <div>Read</div>
            {/*<div>When</div>*/}
            </div>}
            {/*доставлено ли и когда*/}
        </div>
    </div>
}