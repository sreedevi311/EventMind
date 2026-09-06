import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  chatWithVenueAgent,
  bookVenue,
} from "../../services/venueAgentService";

import ChatMessage from "./ChatMessage";
import VenueCarousel from "./VenueCarousel";
import VenueDetailsModal from "./VenueDetailsModal";
import VenueBookingModal from "./VenueBookingModal";

const VenueAgent = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Venue Agent. Tell me what kind of venue you need, including the session title, expected attendance, facilities, date, or timing.",
    },
  ]);

  const [venues, setVenues] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [bookingVenue, setBookingVenue] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

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
      const res = await chatWithVenueAgent({
        message,
      });

      const responseMessage =
        res.data?.message ||
        "Here are the venues I found.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseMessage,
        },
      ]);

      setVenues(res.data?.venues || []);
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
  // OPEN BOOKING MODAL
  // ==========================================

  const handleBookVenue = (venue) => {
    if (isBooking) {
      return;
    }

    if (!venue?.bookingData) {
      toast.error(
        "Booking details are missing. Please provide the session details."
      );
      return;
    }

    setBookingVenue(venue);
    setBookingData(venue.bookingData);
  };

  // ==========================================
  // CONFIRM VENUE BOOKING
  // ==========================================

  const confirmVenueBooking = async (data) => {
    if (!bookingVenue || isBooking) {
      return;
    }

    setIsBooking(true);

    try {
      const res = await bookVenue(
        bookingVenue._id,
        data
      );

      const message =
        res.data?.message ||
        "Venue booked successfully.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `**Venue booked successfully! 🎉**\n\n` +
            `**${bookingVenue.name}** has been reserved for **${data.title}**.\n\n` +
            (res.data?.emailSent
              ? "📧 A confirmation email has also been sent."
              : ""),
        },
      ]);

      toast.success(message);

      setBookingVenue(null);
      setBookingData(null);
      setSelectedIndex(-1);
    } catch (error) {
      const responseData = error.response?.data;

      let message =
        responseData?.message ||
        "Venue booking failed.";

      if (responseData?.conflict) {
        const conflict = responseData.conflict;

        message +=
          `\n\n**Conflict detected:**\n` +
          `The venue is already booked for **${conflict.title}** from ` +
          `**${new Date(
            conflict.startTime
          ).toLocaleString()}** to ` +
          `**${new Date(
            conflict.endTime
          ).toLocaleString()}**.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${message}`,
        },
      ]);

      toast.error(
        responseData?.message ||
          "Venue booking failed."
      );
    } finally {
      setIsBooking(false);
    }
  };

  // ==========================================
  // MODAL NAVIGATION
  // ==========================================

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current <= 0) {
        return venues.length - 1;
      }

      return current - 1;
    });
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current >= venues.length - 1) {
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

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div
              className="
                w-12 h-12 rounded-2xl
                bg-indigo-100 text-indigo-600
                flex items-center justify-center
              "
            >
              <FaRobot className="text-xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Venue Agent
              </h1>

              <p className="text-sm text-gray-500">
                Find and book the perfect venue using natural language
              </p>
            </div>

          </div>
        </div>

        {/* CHAT AREA */}

        <div
          className="
            bg-gray-50 border border-gray-200
            rounded-3xl min-h-[600px]
            flex flex-col overflow-hidden
          "
        >

          {/* MESSAGES */}

          <div
            className="
              flex-1 p-6 space-y-5
              overflow-y-auto
            "
          >

            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
              />
            ))}

            {isProcessing && (
              <div className="flex justify-start">

                <div
                  className="
                    bg-white border border-gray-200
                    rounded-2xl rounded-bl-md
                    px-5 py-3
                    flex items-center gap-3
                    text-gray-500
                  "
                >
                  <FaSpinner className="animate-spin text-indigo-500" />

                  <span>
                    Finding the best venues...
                  </span>
                </div>

              </div>
            )}

            {!isProcessing &&
              venues.length > 0 && (
                <VenueCarousel
                  venues={venues}
                  onSelect={(venue) => {
                    const index =
                      venues.findIndex(
                        (item) =>
                          item._id === venue._id
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
                placeholder="Ask me to find a venue..."
                className="
                  flex-1 resize-none
                  border border-gray-200
                  rounded-2xl px-5 py-3
                  outline-none
                  focus:ring-2 focus:ring-indigo-500
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
                  w-12 h-12 rounded-2xl
                  bg-indigo-600 hover:bg-indigo-700
                  disabled:bg-indigo-300
                  text-white
                  flex items-center justify-center
                  transition flex-shrink-0
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
              Try: "Find a hall for 150 people with
              projector and WiFi on August 20 from
              10 AM to 12 PM for an AI Workshop"
            </p>

          </div>
        </div>
      </div>

      {/* VENUE DETAILS MODAL */}

      {selectedIndex >= 0 && (
        <VenueDetailsModal
          venues={venues}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(-1)}
          onPrevious={showPrevious}
          onNext={showNext}
          onBook={handleBookVenue}
          isBooking={isBooking}
        />
      )}

      {/* VENUE BOOKING MODAL */}

      {bookingVenue && bookingData && (
        <VenueBookingModal
          venue={bookingVenue}
          bookingData={bookingData}
          onClose={() => {
            if (!isBooking) {
              setBookingVenue(null);
              setBookingData(null);
            }
          }}
          onConfirm={confirmVenueBooking}
          isBooking={isBooking}
        />
      )}
    </>
  );
};

export default VenueAgent;