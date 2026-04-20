import { StatusBar } from "expo-status-bar";
import React from "react";
import { AppRoot } from "./src/bootstrap/AppRoot";

export default function App() {
  return (
    <>
      <AppRoot />
      <StatusBar style="auto" />
    </>
  );
}

