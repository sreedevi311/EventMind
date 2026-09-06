import ReactMarkdown from "react-markdown";
import {
  FaRobot,
  FaUser,
} from "react-icons/fa";

const ChatMessage = ({ message }) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex w-full ${
        isAssistant
          ? "justify-start"
          : "justify-end"
      }`}
    >
      <div
        className={`flex gap-3 max-w-[85%] ${
          isAssistant
            ? "flex-row"
            : "flex-row-reverse"
        }`}
      >

        {/* ======================================
            AVATAR
        ====================================== */}

        <div
          className={`
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            flex-shrink-0
            ${
              isAssistant
                ? "bg-indigo-100 text-indigo-600"
                : "bg-indigo-600 text-white"
            }
          `}
        >
          {isAssistant ? (
            <FaRobot className="text-sm" />
          ) : (
            <FaUser className="text-sm" />
          )}
        </div>

        {/* ======================================
            MESSAGE
        ====================================== */}

        <div
          className={`
            px-4
            py-3
            rounded-2xl
            text-sm
            leading-6
            break-words
            ${
              isAssistant
                ? `
                  bg-white
                  border
                  border-gray-200
                  text-gray-700
                  rounded-bl-md
                `
                : `
                  bg-indigo-600
                  text-white
                  rounded-br-md
                `
            }
          `}
        >

          {isAssistant ? (
            <div
              className="
                prose
                prose-sm
                max-w-none
                text-gray-700

                prose-p:my-1.5
                prose-p:leading-6

                prose-headings:text-gray-900
                prose-headings:font-semibold
                prose-headings:my-2

                prose-strong:text-gray-900
                prose-strong:font-semibold

                prose-ul:my-2
                prose-ol:my-2
                prose-li:my-0.5

                prose-code:text-indigo-600
              "
            >
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-6">
              {message.content}
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatMessage;