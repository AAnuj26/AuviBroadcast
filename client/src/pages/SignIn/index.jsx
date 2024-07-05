import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
export default function SignIn() {
  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <div>
        <h1 style={{ color: "white" }}>SignIn Page</h1>
        <Link to="/signup">
          <button>new here?</button>
        </Link>
      </div>
    </>
  );
}
