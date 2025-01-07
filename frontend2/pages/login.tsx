import { FiChevronRight, FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { FiAlertCircle } from "react-icons/fi";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { setAuthenticatedUser } from "../utils/utils";
import UIButton from "@/components/uibutton";
import LightButton from "@/components/lightbutton";

export function Header({
  left,
  right,
  rightLink,
}: {
  left?: string;
  right?: string;
  rightLink?: string;
}) {
  return (
    <div className="items-left flex w-full flex-col justify-between md:flex-row md:items-center">
      <span className="font-h2 my-2 text-2xl md:my-0 md:text-4xl">
        <Image
          src="/logo-white.png"
          alt="tunetree logo"
          className="mx-auto mr-2 inline w-12"
          height="1024"
          width="1024"
        />
        <div className="inline-block">{left}</div>
      </span>
      {right && (
        <Link href={rightLink || "/"}>
          <span className="text-md rainbow-svg inline-block max-w-xs truncate rounded-xl border px-2 md:max-w-full">
            <span>{right}</span>
            <FiChevronRight className="rainbow-svg inline" />
          </span>
        </Link>
      )}
    </div>
  );
}

function Eye({ state }: { state: string }) {
  if (state == "text") {
    return <FiEye className="absolute mr-10" size={15} />;
  } else {
    return <FiEyeOff className="absolute mr-10" size={15} />;
  }
}

interface SetPassword {
  (password: string): void;
}

export function Password({
  name,
  password,
  setPassword,
}: {
  name: string;
  password: string;
  setPassword: SetPassword;
}) {
  const [type, setType] = useState("password");
  const handleToggle = () => {
    if (type === "password") {
      setType("text");
    } else {
      setType("password");
    }
  };

  return (
    <div className="mb-2 flex">
      <input
        className="font-light-bg-norm w-full rounded-lg p-1 text-black"
        type={type}
        name={name}
        placeholder={name == "cpassword" ? "confirm password" : name}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <span
        className="flex cursor-pointer items-center justify-around"
        onClick={handleToggle}
      >
        <Eye state={type} />
      </span>
    </div>
  );
}

export function Message({ content }: { content: string }) {
  if (!content) {
    return <></>;
  }

  return (
    <div className="my-2 rounded-lg bg-red-200 p-2 outline outline-offset-1 outline-red-400">
      <FiAlertCircle className="mr-2 inline text-red-600" size={25} />
      <span className="text-red-700">{content}</span>
    </div>
  );
}

export default function Login() {
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    artist: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
        credentials: "include",
      });

      if (response.ok) {
        // TODO: show this to users better
        responseBody = await response.json();
        setAuthenticatedUser(responseBody);
        window.location.href = "/artist/";
      } else {
        responseBody = await response.text();
        switch (response.status) {
          case 401:
            // Un-authorized
            setMessage(responseBody);
            break;
          case 400:
            // Bad Request
            setMessage(responseBody);
            break;
          case 405:
            // Method not allowed
            throw new Error(responseBody);
          case 500:
            // Internal error
            throw new Error(responseBody);
          default:
            throw new Error(
              "Unhandled response(" + response.status + "): " + responseBody,
            );
        }
      }
    } catch (error) {
      // Handle network or other errors
      setMessage("Something has gone critically wrong: " + error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="fg-color absolute left-1/2 top-1/2 w-11/12 -translate-x-1/2 -translate-y-1/2 transform rounded-lg py-4 md:w-3/5 md:py-8">
        <div className="mx-auto w-11/12 md:w-5/6">
          <Header left="logging in..." />
          <Message content={message} />
          <form className="my-4 flex flex-col" onSubmit={handleSubmit}>
            <input
              className="font-light-bg-norm mb-2 w-full rounded-lg p-1 text-black"
              type="text"
              name="email"
              placeholder="username"
              value={formData.email}
              onChange={(e) => {
                const { name, value } = e.target;
                const newForm = {
                  ...formData,
                  [name]: value,
                };
                setFormData(newForm);
              }}
            />
            <Password
              password={formData.password}
              setPassword={(password: string) => {
                setFormData({
                  ...formData,
                  password: password,
                });
              }}
              name="password"
            />
            <UIButton
              type="confirm"
              content="login"
              submit={true}
              handle={() => {}}
            />
          </form>
          <div>
            <LightButton link="/signup" content="create an account" />
          </div>
          <div>
            <LightButton link="/help" content="need help?" />
          </div>
        </div>
      </div>
    </div>
  );
}
