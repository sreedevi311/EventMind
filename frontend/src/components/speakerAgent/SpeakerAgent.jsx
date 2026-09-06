import { useState } from "react";

import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";

import toast from "react-hot-toast";

import {
  chatWithSpeakerAgent,
  assignSpeaker,
} from "../../services/speakerAgentService";

import SpeakerChatMessage from "./SpeakerChatMessage";
import SpeakerCarousel from "./SpeakerCarousel";
import SpeakerDetailsModal from "./SpeakerDetailsModal";
import SpeakerAssignmentModal from "./SpeakerAssignmentModal";

const SpeakerAgent = () => {
  const [input, setInput] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Speaker Agent. Tell me what kind of speaker you need, including expertise, topic, session type, date, or timing.",
    },
  ]);

  const [speakers, setSpeakers] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [assignmentSpeaker, setAssignmentSpeaker] =
    useState(null);

  const [showAssignmentModal, setShowAssignmentModal] =
    useState(false);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

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
      // NO eventId
      const res = await chatWithSpeakerAgent({
        message,
      });

      const responseMessage =
        res.data?.message ||
        "Here are the speakers I found.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseMessage,
        },
      ]);

      setSpeakers(res.data?.speakers || []);
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

  // ==========================================
  // OPEN ASSIGNMENT MODAL
  // ==========================================

  const openAssignmentModal = (speaker) => {
    setAssignmentSpeaker(speaker);
    setShowAssignmentModal(true);
  };

  // ==========================================
  // CLOSE ASSIGNMENT MODAL
  // ==========================================

  const closeAssignmentModal = () => {
    if (isAssigning) {
      return;
    }

    setShowAssignmentModal(false);
    setAssignmentSpeaker(null);
  };

  // ==========================================
  // ASSIGN SPEAKER
  // ==========================================

  const handleAssignSpeaker = async (assignmentData) => {
    if (!assignmentSpeaker || isAssigning) {
      return;
    }

    setIsAssigning(true);

    try {
      // NO eventId
      const res = await assignSpeaker(
        assignmentSpeaker._id,
        assignmentData
      );

      const message =
        res.data?.message ||
        "Speaker assigned successfully.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `Assignment Successful 🎉\n\n` +
            `${assignmentSpeaker.name} has been successfully assigned to "${assignmentData.title}".` +
            `${
              res.data?.emailSent
                ? "\n\nA confirmation email has also been sent to the speaker."
                : ""
            }`,
        },
      ]);

      toast.success(message);

      // Update speaker status
      setSpeakers((prev) =>
        prev.map((speaker) =>
          speaker._id === assignmentSpeaker._id
            ? {
                ...speaker,
                status: "Assigned",
              }
            : speaker
        )
      );

      setShowAssignmentModal(false);
      setAssignmentSpeaker(null);
      setSelectedIndex(-1);
    } catch (error) {
      const data = error.response?.data;

      let message =
        data?.message ||
        "Speaker assignment failed.";

      if (data?.conflict) {
        message +=
          `\n\nConflict detected:\n` +
          `${data.conflict.title || "Another session"}\n` +
          `${new Date(
            data.conflict.startTime
          ).toLocaleString()} - ` +
          `${new Date(
            data.conflict.endTime
          ).toLocaleString()}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);

      toast.error(
        data?.message ||
          "Speaker assignment failed."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // ==========================================
  // MODAL NAVIGATION
  // ==========================================

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current <= 0) {
        return speakers.length - 1;
      }

      return current - 1;
    });
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current >= speakers.length - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div
              className="
                w-12
                h-12
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
                Speaker Agent
              </h1>

              <p className="text-sm text-gray-500">
                Find and assign the right speakers using
                natural language
              </p>
            </div>

          </div>
        </div>

        {/* CHAT */}

        <div
          className="
            bg-gray-50
            border
            border-gray-200
            rounded-3xl
            h-[700px]
            flex
            flex-col
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
              scrollbar-thin
            "
          >

            {messages.map((message, index) => (
              <SpeakerChatMessage
                key={index}
                message={message}
              />
            ))}

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
                  <FaSpinner
                    className="
                      animate-spin
                      text-indigo-500
                    "
                  />

                  <span>
                    Finding the best speakers...
                  </span>
                </div>

              </div>
            )}

            {!isProcessing &&
              speakers.length > 0 && (
                <SpeakerCarousel
                  speakers={speakers}
                  onSelect={(speaker) => {
                    const index =
                      speakers.findIndex(
                        (item) =>
                          item._id ===
                          speaker._id
                      );

                    setSelectedIndex(index);
                  }}
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
                placeholder="Ask me to find a speaker..."
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
                  w-12
                  h-12
                  rounded-2xl
                  bg-indigo-600
                  hover:bg-indigo-700
                  disabled:bg-indigo-300
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
              Try: "Find a Java expert for a backend
              workshop tomorrow"
            </p>

          </div>

        </div>
      </div>

      {/* SPEAKER DETAILS MODAL */}

      {selectedIndex >= 0 && (
        <SpeakerDetailsModal
          speakers={speakers}
          currentIndex={selectedIndex}
          onClose={() =>
            setSelectedIndex(-1)
          }
          onPrevious={showPrevious}
          onNext={showNext}
          onAssign={openAssignmentModal}
          isAssigning={isAssigning}
        />
      )}

      {/* SPEAKER ASSIGNMENT MODAL */}

      {showAssignmentModal &&
        assignmentSpeaker && (
          <SpeakerAssignmentModal
            speaker={assignmentSpeaker}
            onClose={closeAssignmentModal}
            onAssign={handleAssignSpeaker}
            isAssigning={isAssigning}
          />
        )}
    </>
  );
};

export default SpeakerAgent;