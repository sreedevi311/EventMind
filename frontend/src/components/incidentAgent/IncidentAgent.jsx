import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  chatWithIncidentAgent,
} from "../../services/incidentAgentService";

import ChatMessage from "../venueAgent/ChatMessage";
import IncidentList from "./IncidentList";

const IncidentAgent = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] =
    useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Incident Agent. Ask me about incidents, their severity, priority, affected areas, or recommended actions.",
    },
  ]);

  const [incidents, setIncidents] = useState([]);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || isProcessing) {
      return;
    }

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setIsProcessing(true);

    try {
      const res =
        await chatWithIncidentAgent({
          message,
        });

      const responseMessage =
        res.data?.message ||
        "Here are the incidents I found.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseMessage,
        },
      ]);

      setIncidents(
        res.data?.incidents || []
      );

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "I couldn't process your request right now.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);

      toast.error(errorMessage);

    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}

      <div className="mb-6">

        <div className="flex items-center gap-3">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-red-100
              text-red-600
              flex
              items-center
              justify-center
            "
          >
            <FaRobot className="text-xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Incident Agent
            </h1>

            <p className="text-sm text-gray-500">
              Identify, prioritize and manage event incidents using AI
            </p>
          </div>

        </div>

      </div>

      {/* Chat */}

      <div
        className="
          bg-gray-50
          border
          border-gray-200
          rounded-3xl
          min-h-[600px]
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* Messages */}

        <div
          className="
            flex-1
            p-6
            space-y-5
            overflow-y-auto
          "
        >

          {messages.map(
            (message, index) => (
              <ChatMessage
                key={index}
                message={message}
              />
            )
          )}

          {/* Processing */}

          {isProcessing && (
            <div className="flex justify-start">

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  rounded-bl-md
                  px-5
                  py-3
                  flex
                  items-center
                  gap-3
                  text-gray-500
                "
              >
                <FaSpinner className="animate-spin text-red-500" />

                <span>
                  Analyzing incidents...
                </span>
              </div>

            </div>
          )}

          {/* Incident Results */}

          {!isProcessing &&
            incidents.length > 0 && (
              <IncidentList
                incidents={incidents}
              />
            )}

        </div>

        {/* Input */}

        <div className="border-t bg-white p-4">

          <div className="flex items-end gap-3">

            <textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              rows={1}
              placeholder="Ask me about incidents..."
              className="
                flex-1
                resize-none
                border
                border-gray-200
                rounded-2xl
                px-5
                py-3
                outline-none
                focus:ring-2
                focus:ring-red-500
                focus:border-transparent
                text-gray-700
                disabled:bg-gray-100
              "
            />

            <button
              onClick={sendMessage}
              disabled={
                isProcessing ||
                !input.trim()
              }
              className="
                w-12
                h-12
                rounded-2xl
                bg-red-600
                hover:bg-red-700
                disabled:bg-red-300
                text-white
                flex
                items-center
                justify-center
                transition
                flex-shrink-0
              "
            >
              {isProcessing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>

          </div>

          <p className="text-xs text-gray-400 mt-2 ml-2">
            Try: "Which incidents are currently unresolved?"
          </p>

        </div>

      </div>
    </div>
  );
};

export default IncidentAgent;