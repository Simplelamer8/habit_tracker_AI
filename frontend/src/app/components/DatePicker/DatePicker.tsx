import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function Calendar() {
    const date = new Date();
    const today = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    const [value, setValue] = React.useState<Dayjs | null>(dayjs(today));

    if (value) 
    {
        console.log((value as Dayjs).format("YYYY-MM-DD"));
    }

    return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DatePicker', 'DatePicker']}>
        {/* <DatePicker label="Uncontrolled picker" defaultValue={dayjs('2022-04-17')} /> */}
        <DatePicker
            label="Select Date"
            value={value}
            onChange={(newValue) => setValue(newValue)}
        />
        </DemoContainer>
    </LocalizationProvider>
    );
}
