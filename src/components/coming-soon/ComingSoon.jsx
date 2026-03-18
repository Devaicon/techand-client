"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./ComingSoon.module.css";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [launchDate, setLaunchDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch launch date from server
    const fetchLaunchDate = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/comingsoon`);
        const data = await response.json();
        console.log("Fetch response:", data);

        if (data.launchDate) {
          setLaunchDate(new Date(data.launchDate));
        }
      } catch (error) {
        console.error("Error fetching launch date:", error);
        // Fallback to a default date if fetch fails
        setLaunchDate(new Date("2026-03-01T00:00:00.000Z"));
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchDate();
  }, []);

  useEffect(() => {
    if (!launchDate) return;

    const updateCountdown = () => {
      const currentTime = new Date().getTime();
      const distance = launchDate.getTime() - currentTime;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [launchDate]);

  const formatTime = (value) => String(value).padStart(2, "0");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logo.svg"
            alt="Tech& Logo"
            width={300}
            height={100}
            priority
            className={styles.logo}
          />
        </div>

        <h1 className={styles.tagline}>Your Technology Partner</h1>
        <p className={styles.description}>
          Empowering businesses with innovative technology solutions
        </p>

        <div className={styles.launchText}>Launching Soon</div>

        <div className={styles.countdown}>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>
              {formatTime(timeLeft.days)}
            </span>
            <span className={styles.timeLabel}>Days</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>
              {formatTime(timeLeft.hours)}
            </span>
            <span className={styles.timeLabel}>Hours</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>
              {formatTime(timeLeft.minutes)}
            </span>
            <span className={styles.timeLabel}>Minutes</span>
          </div>
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>
              {formatTime(timeLeft.seconds)}
            </span>
            <span className={styles.timeLabel}>Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
