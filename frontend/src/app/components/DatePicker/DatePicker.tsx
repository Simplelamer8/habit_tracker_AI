"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useMounted } from "@/hooks/use-mounted";
import { useCalendar } from "@/hooks/use-calendar";

export default function Calendar() {
  const mounted = useMounted();
  const [date, setDate] = useCalendar();

  // React.useEffect(() => {
  //     if (mounted) {
  //         setDate(dayjs(value["$d"]).format("YYYY-MM-DD"));
  //     }
  // }, [value])

  // if (value)
  // {
  //     console.log((value as Dayjs).format("YYYY-MM-DD"));
  // }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker", "DatePicker"]}>
        {/* <DatePicker label="Uncontrolled picker" defaultValue={dayjs('2022-04-17')} /> */}
        <DatePicker
          label="Select Date"
          value={dayjs(date)}
          onChange={(value) => {
            if (value) setDate(value.format("YYYY-MM-DD"));
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
