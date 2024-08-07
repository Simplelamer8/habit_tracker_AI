import dayjs from "dayjs";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const dateObject = new Date();
const today = dateObject.getFullYear() + "-" + (dateObject.getMonth() + 1) + "-" + dateObject.getDate();
const defaultValue = dayjs(today).format("YYYY-MM-DD")

const calendarAtom = atomWithStorage<string>("calendar", defaultValue);

export function useCalendar() {
  return useAtom(calendarAtom);
}

