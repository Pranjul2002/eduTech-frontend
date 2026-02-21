import React from 'react'
import style from './page.module.css'

const images = [
  "/homePage/carousel1.png",
  "/homePage/carousel2.png",
  "/homePage/carousel3.png",
  "/homePage/carousel4.png",
  "/homePage/carousel5.png",
  "/homePage/carousel6.png",
  "/homePage/carousel7.png",
];

const Home = () => {
  return (
    <div id={style.home}>
      <div className={style.bannerArea}>
        <div className={style.bannerContainer}>
          <div className={style.bannerText}>
            <h1>
              An easier, more powerful <br/>
              platform to Grow Skills
            </h1>
            <div className={style.bannerSubText}>
              Build your network, share skills, and open up on the Learning <br/>
              platformwhere you can be your whole self Forward Arrow
            </div>
          </div>
        </div>
      </div>

      <div className={style.homeCarouselArea}>
        <div className={style.carouselContainer}>
          <div className={style.carouselTrack}>
            {[...images, ...images, ...images].map((src, index) => (
              <div className={style.carouselItem} key={index}>
                <img src={src} alt={`slide-${index}`} />
              </div>
            ))}
        </div>
        </div>
      </div>
    </div>
  )
}

export default Home