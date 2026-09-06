import React from "react";

const GradientButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="btn-primary w-full"
    >
      {children}
    </button>
  );
};

export default GradientButton;