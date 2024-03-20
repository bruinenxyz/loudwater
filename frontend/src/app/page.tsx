"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import icon from "@assets/icon.svg";
import { AnchorButton, Button, Card } from "@blueprintjs/core";

export default function Home() {
  const router = useRouter();

  return (
    <div className="max-h-full">
      <div className="flex mx-6 my-4 max-w-3xl overflow-y-auto p-1 h-full">
        <div className="flex flex-col space-y-3">
          <Image src={icon} alt="Bruinen Icon" width={72} height={72} />
          <h1 className="bp5-heading"> Welcome to Bruinen.</h1>
          <h5 className="bp5-heading">The data platform for everyone</h5>
          <div>
            Bruinen helps you organize data into logical groups called
            &quot;objects&quot;, each object has a blueprint which can be
            configured to your needs. These objects can come from anywhere, from
            a database, a file, or even a web API.
          </div>
          <div>
            Objects can be viewed, edited, queried and related to each other to
            create a rich model of your business or project.
          </div>
          <h2 className="bp5-heading"> Learn more</h2>
          <div className="grid grid-cols-2 gap-2 pb-4">
            <Card className="flex flex-col">
              <h5 className="bp5-heading">Getting Started</h5>
              <div>
                Learn how to get started with Bruinen and start building your
                first object.
              </div>
              <div className="mt-auto">
                <AnchorButton
                  fill
                  icon="arrow-right"
                  target="_blank"
                  href="https://docs.bruinen.co/getting-started"
                  className="mt-2"
                >
                  Getting Started
                </AnchorButton>
              </div>
            </Card>
            <Card className="flex flex-col">
              <h5 className="bp5-heading">Bruinen Documentation</h5>
              <div>
                Access the comprehensive documentation for Bruinen to learn more
                about its features and capabilities.
              </div>
              <div className="mt-auto">
                <AnchorButton
                  icon="arrow-right"
                  fill
                  className="mt-2"
                  target="_blank"
                  href="https://docs.bruinen.co"
                >
                  Documentation
                </AnchorButton>
              </div>
            </Card>
            <Card>
              <h5 className="bp5-heading">Get in Touch</h5>
              <div>
                Have questions or need assistance? Contact our team for support
                and guidance.
              </div>
              <div className="mt-auto">
                <Button
                  icon="arrow-right"
                  className="mt-2"
                  fill
                  onClick={() => router.push("mailto:tevon@bruinen.co")}
                >
                  Contact Us
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
