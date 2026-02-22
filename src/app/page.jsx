"use client"

import React from "react"
import Image from "next/image"
import { Gideon_Roman } from "next/font/google"
import style from "./page.module.css"

const gideon = Gideon_Roman({
  weight: "400",
  subsets: ["latin"],
})

const images = [
  "/homePage/carousel1.png",
  "/homePage/carousel2.png",
  "/homePage/carousel3.png",
  "/homePage/carousel4.png",
  "/homePage/carousel5.png",
  "/homePage/carousel6.png",
  "/homePage/carousel7.png",
]

const Home = () => {
  return (
    <div className={style.home}>

      {/* Banner */}
      <div className={style.bannerArea}>
        <div className={style.bannerContainer}>
          <div className={`${style.bannerText} ${gideon.className}`}>
            <h1>
              An easier, more powerful <br />
              platform to Grow Skills
            </h1>

            <div className={style.bannerSubText}>
              Build your skills, and open up on the Learning <br />
              platform where Education Blooms.
            </div>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className={style.homeCarouselArea}>
        <div className={style.carouselContainer}>
          <div className={style.carouselTrack}>
            {[...images, ...images].map((src, index) => (
              <div className={style.carouselItem} key={index}>
                <Image
                  src={src}
                  alt={`slide-${index}`}
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Section */}
      <section className={style.growthMindSetArea}>
        <div className={style.container}>
          <p className={`${style.growthText} ${gideon.className}`}>
            Starting is essential for progress.
            <br />
            ________________________________
            <br />
            "An investment in knowledge always pays the best interest."
            <br />– Benjamin Franklin
          </p>
        </div>
      </section>

    </div>
  )
}

export default Home