import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  chatWithSponsorshipAgent,
} from "../../services/sponsorshipAgentService";

import ChatMessage from "../venueAgent/ChatMessage";
import SponsorCarousel from "./SponsorCarousel";
import SponsorDetailsModal from "./SponsorDetailsModal";

const SponsorshipAgent = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Sponsorship Agent. Ask me about sponsors, pending deliverables, payments, branding, booth allocation, or sponsor performance.",
    },
  ]);

  const [sponsors, setSponsors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || isProcessing) return;

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
        await chatWithSponsorshipAgent({
          message,
        });

      const responseMessage =
        res.data?.message ||
        "I couldn't find sponsorship information.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseMessage,
        },
      ]);

      setSponsors(res.data?.sponsors || []);
      setAnalytics(res.data?.analytics || null);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div
              className="
                w-12 h-12
                rounded-2xl
                bg-indigo-100
                text-indigo-600
                flex
                items-center
                justify-center
              "
            >
              <FaRobot className="text-xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sponsorship Agent
              </h1>

              <p className="text-sm text-gray-500">
                Manage sponsors and monitor sponsorship performance using AI
              </p>
            </div>

          </div>
        </div>

        {/* CHAT */}

        <div
          className="
            bg-gray-50
            border border-gray-200
            rounded-3xl
            min-h-[600px]
            flex flex-col
            overflow-hidden
          "
        >

          {/* MESSAGES */}

          <div
            className="
              flex-1
              p-6
              space-y-5
              overflow-y-auto
            "
          >

            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
              />
            ))}

            {/* PROCESSING */}

            {isProcessing && (
              <div className="flex justify-start">

                <div
                  className="
                    bg-white
                    border border-gray-200
                    rounded-2xl
                    rounded-bl-md
                    px-5 py-3
                    flex items-center gap-3
                    text-gray-500
                  "
                >
                  <FaSpinner
                    className="
                      animate-spin
                      text-indigo-500
                    "
                  />

                  <span>
                    Analyzing sponsorship data...
                  </span>
                </div>

              </div>
            )}

            {/* SPONSOR CARDS */}

            {!isProcessing &&
              sponsors.length > 0 && (
                <SponsorCarousel
                  sponsors={sponsors}
                  onSelect={(sponsor) =>
                    setSelectedSponsor(sponsor)
                  }
                />
              )}

          </div>

          {/* INPUT */}

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
                placeholder="Ask me about sponsors..."
                className="
                  flex-1
                  resize-none
                  border border-gray-200
                  rounded-2xl
                  px-5 py-3
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
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
                  w-12 h-12
                  rounded-2xl
                  bg-indigo-600
                  hover:bg-indigo-700
                  disabled:bg-indigo-300
                  text-white
                  flex items-center
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
              Try: "Which sponsors have pending deliverables?"
            </p>

          </div>

        </div>
      </div>

      {/* DETAILS MODAL */}

      {selectedSponsor && (
        <SponsorDetailsModal
          sponsor={selectedSponsor}
          onClose={() =>
            setSelectedSponsor(null)
          }
        />
      )}
    </>
  );
};

export default SponsorshipAgent;