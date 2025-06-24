import React from "react";

function GlobalFooter() {
  return (
    <div className="py-6">
      <p className="text-center text-xs text-disabled font-light">
        © {new Date().getFullYear()} Developed By YongHoon
      </p>
    </div>
  );
}

export default GlobalFooter;
