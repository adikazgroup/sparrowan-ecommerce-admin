import React from "react";

export default function ErrorBoundaryFetcher() {
  return (
    <div className="w-full py-20 center text-red-400">
      Something went wrong while fetching data, Please try again later...
    </div>
  );
}
