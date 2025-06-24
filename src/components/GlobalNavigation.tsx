import React from "react";

function GlobalNavigation() {
  return (
    <nav className="px-6 py-2.5 bg-gnb-background">
      <ul className="flex justify-between">
        <div className="flex gap-x-2 items-center">
          <li className="size-10 bg-muted-foreground rounded-full"></li>
          <li>Video Sync Player</li>
        </div>
        <div className="flex gap-x-3 ">
          <li className="size-10 bg-muted-foreground rounded-full"></li>
          <li className="size-10 bg-muted-foreground rounded-full"></li>
        </div>
      </ul>
    </nav>
  );
}

export default GlobalNavigation;
