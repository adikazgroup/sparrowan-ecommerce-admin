"use client";
import React from "react";
import { store } from "@/features/store";
import { Provider } from "react-redux";

export default function ReduxLayout({ children }) {
  return (
    <div>
      <Provider store={store}>{children}</Provider>
    </div>
  );
}
