import { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import * as idlActor from "../../declarations/simpleauth_backend/index";

function App() {
  const [loginId, setLoginId] = useState<string>("");

  // Test Internet Identity Info
  useEffect(() => {
    const getII = async () => {
      // Declare AuthClient
      const authClient = await AuthClient.create();

      // check is auth using AuthClient
      if (await authClient.isAuthenticated())
        // set Login id
        setLoginId(authClient.getIdentity().getPrincipal().toString());
      // set Login id
      else setLoginId("Unknown");
    };

    getII();
  }, []);

  // Login Handler (Pop Up Window mode)
  const loginHandler = async () => {
    // Declare AuthClient
    const authClient = await AuthClient.create();

    // Start Login Page
    authClient.login({
      identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`, // II Provider
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // Expire Time
      windowOpenerFeatures:
        "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100", // <- comment this for turn off pop up window
      onSuccess: () => {
        // If Login Success
        console.log("Login Success");
        // Refresh Page
        window.location.reload();
      },
      onError: () => {
        // If Login Failed
        console.log("Login Error");
      },
    });
  };

  // Logout Handler
  const logoutHandler = async () => {
    // Declare AuthClient
    const authClient = await AuthClient.create();

    // Logout User
    authClient.logout({
      returnTo: `http://${process.env.CANISTER_ID_SIMPLEAUTH_FRONTEND}.localhost:4943`,
    });

    // Refresh Page
    window.location.reload();
  };

  // Test Call Web3 Backend
  useEffect(() => {
    // Creating Agent
    const agent = new HttpAgent({
      host: "http://localhost:4943",
    });
    // fetch Agent Root Key (For Security Purpose)
    agent.fetchRootKey();

    // Creating Actor for Interacting with Web3 Backend
    const actor = idlActor.createActor(
      process.env.CANISTER_ID_SIMPLEAUTH_BACKEND ?? ""
    );

    // Call Greet Function from Web3 Backend
    actor.greet(loginId).then((greeting) => {
      // Print Greeting
      console.log(greeting);
    });
  });

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <h1>SimpleAuth Frontend</h1>
      <h3>Login By : {loginId}</h3>
      {loginId === "Unknown" ? (
        <button onClick={() => loginHandler()} type="submit">
          Login
        </button>
      ) : (
        <button onClick={() => logoutHandler()} type="submit">
          Logout
        </button>
      )}
    </main>
  );
}

export default App;
