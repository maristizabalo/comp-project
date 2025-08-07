import React from "react";

const SectionCard = ({ children }) => (
  <div className="rounded-2xl shadow-lg p-6 bg-white transition-opacity duration-300 ease-in-out">
    {children}
  </div>
);

export default React.memo(SectionCard);