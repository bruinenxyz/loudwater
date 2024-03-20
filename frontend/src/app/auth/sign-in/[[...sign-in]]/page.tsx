"use client";

import { SignIn } from "@clerk/clerk-react";
import { useState } from "react";
import logoText from "@assets/logo-text.svg";
import Image from "next/image";
import { Colors } from "@blueprintjs/colors";
import { Button, Icon } from "@blueprintjs/core";

export default function SignInPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <head>
        <title>Sign in</title>
      </head>
      <div
        className="flex items-center justify-center w-full min-h-screen"
        style={{ background: Colors.DARK_GRAY3 }}
      >
        {showSignIn && process.env.NEXT_PUBLIC_USE_AUTH === "true" ? (
          <SignIn
            path="/auth/sign-in"
            routing="hash"
            signUpUrl="/auth/sign-up"
            afterSignInUrl="/"
          />
        ) : (
          <div className="flex flex-col items-center">
            <Image
              src={logoText}
              alt="Bruinen"
              width={200}
              height={42}
              className="mb-4"
            />
            <Button
              className="w-full"
              intent="primary"
              rightIcon={<Icon icon="arrow-right" size={14} />}
              onClick={() => setShowSignIn(true)}
            >
              Sign in
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
