"use client";
import React, { useEffect, useState } from "react";
import DateHeader from "../components/DateHeader/DateHeader";
import plus from "../../images/plus.svg";
import { ErrorMessage, Field, Form, Formik } from "formik";
import HabitCard from "../components/HabitCard/HabitCard";
import axios from "axios";
import { useRouter } from "next/navigation";
import Calendar from "../components/DatePicker/DatePicker";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import dayjs from "dayjs";
import NewNote from "../notes/page";
import { useCalendar } from "@/hooks/use-calendar";
import Header from "../components/Header/header";

export default function MainPage() {
  interface Habit {
    title: string;
    description: string;
    goal: string;
    time_frame: number | null;
  }
  const [showForm, setShowForm] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const router = useRouter();

  const [date, setDate] = useCalendar();

  useEffect(() => {
    async function getHabits() {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const user_id = userData.user_id;
        const { accessToken } = userData;
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const check_response = await axios.get(
          `http://localhost:8080/rating_exists`,
          {
            params: {
              date: date,
              user_id: user_id,
            },
          }
        );
        // console.log(check_response);

        if (check_response.data.length !== 0) {
          router.push("/notes");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/get_habits?user_id=${user_id}`,
          { headers }
        );

        if (response.data.length === 0) {
          return router.push("/get_started");
        }
        setHabits(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    getHabits();
  }, [date]);

  interface Values {
    habitName: string;
    habitDescription: string;
    habitGoal: string;
    habitTimeFrame: number | null;
  }

  function showAddHabitForm() {
    setShowForm((prev) => !prev);
    setAdvancedOptions(false);
  }

  async function rateHabit() {
    const date1 = new Date();
    const date2 = new Date(date);
    if (date1 < date2) {
      alert(
        "You can not proceed to note-taking because the date has not arrived"
      );
      return;
    }
    try {
      const user_id = JSON.parse(localStorage.getItem("userData")).user_id;
      // const date = new Date();
      // const today =
      //   date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      // const formatted_today = dayjs(today).format("YYYY-MM-DD");
      const response = await axios.post("http://localhost:8080/rate_habit", {
        user_id,
        date,
        rating,
        habitName: habits[0].title,
      });
      router.push("/notes");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="flex flex-col items-center">
        <Calendar />
      </div>
      <main className="flex flex-col items-center justify-between min-h-screen px-5 mt-5">
        <div className="w-full flex flex-col items-center">
          {habits.map((habit, index) => (
            <HabitCard
              key={index}
              title={habit.title}
              description={habit.description}
              goal={habit.goal}
              time_frame={habit.time_frame}
              rating={rating}
              setRating={setRating}
            />
          ))}
        </div>

        <div className="flex flex-col w-full justify-center items-center">
          {/* <div className='bg-blue-700 rounded-full p-4 mb-5' onClick={showAddHabitForm}> */}
          {/* <img src={`${plus.src}`} alt="" /> */}
          {/* </div> */}
          {/* {
              showForm && 
              <Formik 
                initialValues={{
                  habitName: "",
                  habitDescription: "",
                  habitGoal: "",
                  habitTimeFrame: 0
                }}
                onSubmit={
                  (values: Values) => {
                    setHabits((prev) => [...prev, {title: values.habitName, description: values.habitDescription, goal: values.habitGoal, time_frame: values.habitTimeFrame}])
                  }
                }
                validate={(values) => {
                  let errors = {habitName: "", habitTimeFrame: ""};
                  if (!values.habitName)
                  {
                    errors.habitName = "Required";
                  }

                  if (advancedOptions && values.habitTimeFrame && isNaN(values.habitTimeFrame))
                  {
                    errors.habitTimeFrame = "The field should only contain numbers";
                    return errors;
                  }

                  if (!errors.habitName)
                  {
                    return {};
                  }
                  return errors;
                }}
              >
                <Form>
                  <div className='top-28 bg-slate-800 flex flex-col items-center p-5 rounded-md'>
                    <Field id="habitName" name="habitName" className="pl-2" placeholder="Habit hame" />
                    <ErrorMessage name="habitName" component="div" className='text-red-600' />
                    <Field id="habitDescription" name="habitDescription" className="mt-5 pl-2" placeholder="Habit description" />
                    <ErrorMessage name="habitDescription" component="div" className='text-red-600' />
                    <button className='text-slate-400' onClick={() => setAdvancedOptions((prev) => !prev)} type='button'>Advanced options</button>
                    {
                      advancedOptions 
                      && 
                      <>
                        <p className='text-white'>I want to achieve the goal of: </p>
                        <Field id="habitGoal" name="habitGoal" className="mt-5 pl-2" placeholder="Habit Goal" />
                        <ErrorMessage name="habitGoal" component="div" className='text-red-600' />
                        <p className='text-white mt-2'>Within: </p>
                        <Field id="habitTimeFrame" name="habitTimeFrame" type="number" className="mt-2 pl-2" placeholder="The time frame for your goal" />
                        <ErrorMessage name="habitTimeFrame" component="div"  className='text-red-600' />
                        <p className='text-white'>Days. P.S.: Be realistic and set the achievable goal (Don't act on the basis of your ego...)</p>
                      </>
                    }
                    <button type="submit" className='text-white mt-5'>Create habit</button>
                  </div>
                </Form>
              </Formik>
            } */}
          <button
            onClick={rateHabit}
            className="p-5 bg-slate-800 rounded-full text-white w-full mt-5 mb-0"
          >
            Next step
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
