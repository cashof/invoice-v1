"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Spinner } from "./ui/spinner";

export default function SignOut() {
  const [isloading, setIsloading] = useState(false);
  const router = useRouter();
  const signout = async () => {
    setIsloading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
    setIsloading(false);
  };
  return (
    <div>
      <Button
        variant={"ghost"}
        onClick={signout}
        className={"flex flex-1 justify-start items-center w-full"}
        disabled={isloading}
      >
        {isloading ? (
          <div className="flex flex-1 justify-start items-center gap-2">
            <LogOut />
            SignOut
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-1 justify-start items-center gap-2">
            <LogOut />
            SignOut
          </div>
        )}
      </Button>
    </div>
  );
}
