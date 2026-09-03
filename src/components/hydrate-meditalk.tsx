import { useEffect } from "react";
import { useMediTalk } from "@/lib/store";

export function HydrateMediTalk() {
  useEffect(() => {
    void useMediTalk.persist.rehydrate();
  }, []);
  return null;
}
