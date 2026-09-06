import { useEffect, useRef, useState } from "react";
import { FiSend, FiUser, FiCheckCircle } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

import { sendMessage } from "../services/registrationAgentService";


const AIRegistration = () => {

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const [isCompleted, setIsCompleted] = useState(false);


    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);


    const sessionId = useRef(
        localStorage.getItem("registrationSession") ||
        crypto.randomUUID()
    );


    const scrollToBottom = () => {

        messagesEndRef.current?.scrollIntoView({
            behavior:"smooth"
        });

    };


    useEffect(() => {

        scrollToBottom();

    }, [messages, loading]);


    useEffect(() => {

        if(!loading && !isCompleted){
            inputRef.current?.focus();
        }

    }, [loading, isCompleted, messages]);


    useEffect(() => {

        localStorage.setItem(
            "registrationSession",
            sessionId.current
        );

        startConversation();

    }, []);



    const startConversation = async()=>{

        setLoading(true);

        try{

            const res = await sendMessage(
                sessionId.current,
                ""
            );


            setMessages([
                {
                    sender:"ai",
                    text:
                    res.data?.reply ||
                    "Hello! How can I help you with registration?"
                }
            ]);

        }

        catch(error){

            setMessages([
                {
                    sender:"ai",
                    text:
                    "Unable to start assistant. Please refresh."
                }
            ]);

        }

        finally{

            setLoading(false);

        }

    };




    const handleSend = async(e)=>{

        e.preventDefault();


        if(
            !input.trim() ||
            loading ||
            isCompleted
        )
            return;



        const text=input.trim();


        setMessages(prev=>[
            ...prev,
            {
                sender:"user",
                text
            }
        ]);


        setInput("");

        setLoading(true);



        try{


            const res = await sendMessage(
                sessionId.current,
                text
            );



            setMessages(prev=>[
                ...prev,
                {
                    sender:"ai",
                    text:res.data?.reply
                }
            ]);



            if(res.data?.completed){

                setIsCompleted(true);

                // Registration is already processed by the backend AI controller.
                // Do NOT call createRegistration() again.

                localStorage.removeItem("registrationSession");

            }


        }

        catch(error){


            setMessages(prev=>[

                ...prev,

                {

                    sender:"ai",

                    text:
                    "Something went wrong. Please try again."

                }

            ]);


        }

        finally{

            setLoading(false);

        }

    };



    return (

        <div className="
            relative
            h-[calc(100vh-120px)]
            bg-gradient-to-br
            from-blue-100
            via-sky-50
            to-white
            rounded-3xl
            shadow-xl
            border
            border-blue-200
            flex
            flex-col
            min-h-0
            overflow-hidden
        ">


            {/* Blue Ambient Background */}

            <div className="
                absolute
                -top-20
                -left-20
                w-96
                h-96
                bg-blue-300/40
                rounded-full
                blur-3xl
            "/>


            <div className="
                absolute
                top-1/3
                -right-20
                w-80
                h-80
                bg-sky-300/40
                rounded-full
                blur-3xl
            "/>


            <div className="
                absolute
                -bottom-20
                left-1/3
                w-96
                h-96
                bg-cyan-200/40
                rounded-full
                blur-3xl
            "/>



            {/* Header */}

            <div className="
                relative
                z-10
                p-5
                border-b
                border-blue-200
                bg-blue-100/70
                backdrop-blur-md
                flex
                justify-between
                items-center
            ">


                <div className="
                    flex
                    items-center
                    gap-3
                ">


                    <div className="
                        w-11
                        h-11
                        rounded-2xl
                        gradient-primary
                        flex
                        items-center
                        justify-center
                        text-white
                    ">

                        <FaRobot/>

                    </div>


                    <div>

                        <h2 className="
                            font-bold
                            text-lg
                            text-slate-800
                        ">

                            AI Registration Assistant

                        </h2>


                        <p className="
                            text-xs
                            text-blue-700
                        ">

                            Intelligent Event Registration

                        </p>


                    </div>


                </div>



                {
                    isCompleted &&

                    <span className="
                        flex
                        items-center
                        gap-2
                        px-3
                        py-1
                        rounded-full
                        bg-green-100
                        text-green-700
                        text-sm
                    ">

                        <FiCheckCircle/>

                        Completed

                    </span>
                }


            </div>




            {/* Messages */}


            <div className="
                relative
                z-10
                flex-1
                min-h-0
                overflow-y-auto
                p-6
                space-y-5
                bg-blue-100/40
            ">


                {
                    messages.map((msg,index)=>{


                        const isUser =
                        msg.sender==="user";


                        return (

                            <div
                                key={index}
                                className={`
                                    flex
                                    gap-3
                                    ${
                                    isUser
                                    ?"flex-row-reverse"
                                    :""
                                    }
                                `}
                            >


                                <div className={`
                                    w-9
                                    h-9
                                    rounded-xl
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    ${
                                    isUser
                                    ?"bg-slate-800"
                                    :"gradient-primary"
                                    }
                                `}>

                                    {
                                        isUser
                                        ?
                                        <FiUser/>
                                        :
                                        <FaRobot/>
                                    }

                                </div>




                                <div className={`
                                    max-w-lg
                                    px-5
                                    py-3
                                    rounded-2xl
                                    text-sm
                                    ${
                                    msg.isSuccessBanner
                                    ?
                                    "bg-green-50 text-green-800 border border-green-200"
                                    :
                                    isUser
                                    ?
                                    "gradient-primary text-white"
                                    :
                                    "bg-blue-50/90 text-slate-800 border border-blue-200"
                                    }
                                `}>

                                    {msg.text}

                                </div>


                            </div>

                        );


                    })

                }



                {
                    loading &&

                    <div className="
                        flex
                        gap-3
                        items-center
                    ">

                        <div className="
                            w-9
                            h-9
                            rounded-xl
                            gradient-primary
                            text-white
                            flex
                            items-center
                            justify-center
                        ">

                            <FaRobot/>

                        </div>


                        <div className="
                            bg-blue-50
                            border
                            border-blue-200
                            rounded-xl
                            px-5
                            py-3
                        ">

                            AI is typing...

                        </div>


                    </div>

                }


                <div ref={messagesEndRef}/>


            </div>




            {/* Input */}


            <div className="
                relative
                z-10
                shrink-0
                p-4
                border-t
                border-blue-200
                bg-blue-100/70
                backdrop-blur-md
            ">


                <form
                    onSubmit={handleSend}
                    className="
                        flex
                        gap-3
                    "
                >


                    <input

                        ref={inputRef}

                        autoFocus

                        value={input}

                        onChange={
                            e=>setInput(e.target.value)
                        }

                        disabled={
                            loading ||
                            isCompleted
                        }

                        placeholder={
                            isCompleted
                            ?
                            "Registration completed"
                            :
                            "Type your response..."
                        }

                        className="
                            input
                            flex-1
                            bg-white
                            border-blue-200
                        "

                    />



                    <button

                        disabled={
                            !input.trim() ||
                            loading ||
                            isCompleted
                        }

                        className="
                            gradient-primary
                            px-6
                            rounded-xl
                            text-white
                            disabled:opacity-50
                        "
                    >

                        {
                            isCompleted
                            ?
                            <FiCheckCircle/>
                            :
                            <FiSend/>
                        }


                    </button>


                </form>


            </div>


        </div>

    );

};


export default AIRegistration;