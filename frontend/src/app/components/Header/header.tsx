import React, { useEffect, useState } from "react";
import styles from "./header.module.css";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import logo from "@/images/habit-tracker-favicon-white.png";
import logout from "@/images/logout.svg";

export default function Header() {
  const [burgerClass, setBurgerClass] = useState("unclicked");
  const [menuClass, setMenuClass] = useState("menu hidden");
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(null);
  const [averageRating, setAverageRating] = useState(0.0);
  const route = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log(userData);
    setUserEmail(userData.email);
  }, []);

  function updateMenu() {
    if (!isMenuClicked) {
      setBurgerClass("burger-bar clicked");
      setMenuClass("menu visible");
      setIsMenuClicked(true);
    } else {
      setBurgerClass("burger-bar unclicked");
      setMenuClass("menu hidden");
      setIsMenuClicked(false);
    }
  }

  async function getAverageRating() {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const user_id = userData.user_id;
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8080/get_average_rating?user_id=${user_id}`
      );
      setIsLoading(false);
      setAverageRating(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  function exitUser() {
    localStorage.removeItem("userData");
    route.push("/login_register");
  }

  return (
    <div className="relative min-h-full flex flex-col">
      <nav className={`${styles.nav} bg-slate-800 p-2 flex justify-between`}>
        <img
          src={logo.src}
          alt=""
          className="w-14"
          onClick={() => route.push("/")}
        />
        <div
          className="burger-menu flex flex-col items-start justify-between cursor-pointer md:hidden"
          onClick={updateMenu}
        >
          <>
            <div
              className={`${styles.burger_bar} ${
                isMenuClicked && styles.clicked
              }`}
            ></div>
            <div
              className={`${styles.burger_bar} ${
                isMenuClicked && styles.clicked
              }`}
            ></div>
            <div
              className={`${styles.burger_bar} ${
                isMenuClicked && styles.clicked
              }`}
            ></div>
          </>
        </div>

        <div className="max-sm:hidden flex items-center">
          {isLoading && <CircularProgress />}
          {isLoading === false && (
            <p className="text-white">
              Your average score is:<span>{averageRating || 0}</span>
            </p>
          )}

          <button
            className="bg-slate-100 rounded-full text-black w-full mr-5"
            onClick={getAverageRating}
          >
            Get average rating score!
          </button>
          <div className="flex items-center justify-between">
            <p className="text-white  mr-5">{userEmail}</p>
            <button
              className="bg-white rounded-3xl flex items-center px-9 pr-14  py-5 border-black"
              onClick={exitUser}
            >
              <img src={logout.src} alt="" />
              <p>Logout</p>
            </button>
          </div>
        </div>
      </nav>
      {isMenuClicked && (
        <>
          <div className={`${styles.menu}`}>
            <div className="flex items-center justify-between">
              <button
                className="p-5 bg-white rounded-full mb-0 flex items-center border-black mr-3"
                onClick={exitUser}
              >
                <img src={logout.src} alt="" />
                Logout
              </button>
              <p>{userEmail}</p>
            </div>
            {isLoading && <CircularProgress />}
            {isLoading === false && (
              <p>
                Your average score is:<span>{averageRating}</span>
              </p>
            )}
            <button
              className="p-5 bg-slate-800 rounded-full text-white w-full mt-5 mb-0"
              onClick={getAverageRating}
            >
              Get average rating score!
            </button>
          </div>
        </>
      )}
    </div>
  );
}
