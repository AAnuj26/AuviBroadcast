import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
export default function SignUp() {
  return (
    <>
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <div>
        <h1 style={{ color: "white" }}>SignUp Page</h1>
        <Link to="/">
          <button>Done</button>
        </Link>
      </div>
    </>
  );
}
