import {
  FaRobot,
  FaUser,
} from "react-icons/fa";

// ==========================================
// SIMPLE MARKDOWN RENDERER
// Supports **bold** and bullet points
// ==========================================

const renderFormattedText = (text) => {
  if (!text) return null;

  return text.split("\n").map(
    (line, index) => {

      // Bullet point
      if (
        line.trim().startsWith("- ")
      ) {
        const content =
          line.trim().substring(2);

        return (
          <div
            key={index}
            className="flex gap-2 mb-1"
          >
            <span>•</span>

            <span>
              {renderBold(content)}
            </span>
          </div>
        );
      }

      return (
        <div key={index}>
          {line.trim() === ""
            ? "\u00A0"
            : renderBold(line)}
        </div>
      );
    }
  );
};

// ==========================================
// BOLD TEXT
// Converts **text** → <strong>text</strong>
// ==========================================

const renderBold = (text) => {
  const parts =
    text.split(/(\*\*.*?\*\*)/g);

  return parts.map(
    (part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    }
  );
};

const SpeakerChatMessage = ({
  message,
}) => {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[80%] ${
          isUser
            ? "flex-row-reverse"
            : ""
        }`}
      >
        {/* Avatar */}

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          {isUser ? (
            <FaUser className="text-sm" />
          ) : (
            <FaRobot className="text-sm" />
          )}
        </div>

        {/* Message */}

        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm"
          }`}
        >
          {renderFormattedText(
            message.content
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerChatMessage;