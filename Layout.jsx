import React from "react";
import Navbar from "./Navbar";
import LoggedNavbar from "./LoggedNavbar"; // Use the correct name
import Footer from "./Footer";

function Layout({ children }) {
  const user = localStorage.getItem("user"); // Check if user is logged in

  return (
    <div className="flex flex-col min-h-screen">
      {user ? <LoggedNavbar /> : <Navbar />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
