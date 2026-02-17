import React from 'react'
import './pageStyle.css'

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
    <div id='home'>
      <div className='bannerArea'>
        <div className='bannerContainer'>
          <div className='bannerText'>
            <h1>
              An easier, more powerful <br/>
              platform to Grow Skills
            </h1>
            <div className='bannerSubText'>
              Build your network, share skills, and open up on the Learning <br/>
              platformwhere you can be your whole self Forward Arrow
            </div>
          </div>
        </div>
      </div>

      <div className='homeCarouselArea'>
        <div className='carouselContainer'>
          <div className="carouselTrack">
            {[...images, ...images, ...images].map((src, index) => (
              <div className="carouselItem" key={index}>
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