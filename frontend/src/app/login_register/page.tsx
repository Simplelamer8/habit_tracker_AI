"use client";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginRegister() {
  const route = useRouter();
  const [loginRegister, setLoginRegister] = useState("login");

  interface Values {
    email: string;
    password: string;
    repeatPassword: string;
  }

  async function handleLogin(
    email: string,
    password: string,
    repeatPassword: string
  ) {
    if (loginRegister === "register") {
      try {
        const response = await axios.post("http://localhost:8080/register", {
          email,
          password,
        });
        console.log(response);
        localStorage.setItem("userData", JSON.stringify(response.data));
        setLoginRegister("login");
      } catch (error) {
        if (error.response.data.detail.includes("already exists")) {
          alert("User with such email already exists");
        }
        console.log(error);
      }
    } else {
      try {
        const response = await axios.post("http://localhost:8080/login", {
          email,
          password,
        });
        console.log(response);
        localStorage.setItem("userData", JSON.stringify(response.data));
        route.push("/habit");
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* <div className='header'>
            <button onClick={() => setLoginRegister("login")}>Login</button>
            <button onClick={() => setLoginRegister("register")}>Register</button>
        </div> */}
      <Formik
        initialValues={{
          email: "",
          password: "",
          repeatPassword: "",
        }}
        onSubmit={(values: Values) => {
          handleLogin(values.email, values.password, values.repeatPassword);
        }}
        validate={(values) => {
          let errors = { email: "", password: "", repeatPassword: "" };
          if (!values.email) {
            errors.email = "Required";
            return errors;
          }
          if (!values.password) {
            errors.password = "Required";
            return errors;
          }

          if (
            loginRegister === "register" &&
            values.repeatPassword !== values.password
          ) {
            // Check this if
            console.log("password and repeat password are not same");
            errors.repeatPassword = "password and repeat password are not same";
            return errors;
          }

          if (
            !values.email.match(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
          ) {
            errors.email = "Incorrect format of email";
            return errors;
          }

          return {};
        }}
      >
        <Form>
          <div className="top-28 bg-slate-800 flex flex-col items-center p-5 rounded-md md:w-96">
            <div className="header flex justify-between w-full px-[30%] mb-5">
              <button
                onClick={() => setLoginRegister("login")}
                type="button"
                className="text-white"
              >
                Login
              </button>
              <button
                onClick={() => setLoginRegister("register")}
                type="button"
                className="text-white"
              >
                Register
              </button>
            </div>
            <Field
              id="email"
              name="email"
              className="pl-2"
              placeholder="Your email"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-600"
            />
            <Field
              id="password"
              name="password"
              type="password"
              className="mt-5 pl-2"
              placeholder="Password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-600"
            />
            {/* <button className='text-slate-400' onClick={() => setAdvancedOptions((prev) => !prev)} type='button'>Advanced options</button> */}
            {loginRegister === "register" && (
              <>
                <Field
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  className="mt-5 pl-2"
                  placeholder="Repeat password"
                />
                <ErrorMessage
                  name="repeatPassword"
                  component="div"
                  className="text-red-600 text-sm text-center"
                />
              </>
            )}
            <button type="submit" className="text-white mt-5">
              {loginRegister}
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
