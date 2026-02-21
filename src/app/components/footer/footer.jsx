import React from 'react'
import Link from 'next/link'

import style from './footer.module.css'

const footer = () => {
  return (
    <div id={style.footer}>
        <div className={style.footerArea}>
            <div className={style.footerAreaWraper}>
                <div className={style.container}>
                    <div className={style.footerColumn}>
                        <div className={style.footerAboutUs}>
                            <div className={style.logo}><h1>EdTech</h1></div>
                            <div className={style.footerAboutUsPara}>
                                Build your network, share skills, <br />
                                and open up on the Learning <br />
                                platform where you can be your <br />
                                whole self Forward Arrow
                            </div>
                        </div>
                        <div className={style.socialMediaBlock}></div>
                    </div>
                </div>
                <div className={style.copywriteContent}>
                    <div className={style.copywriteText}>
                        Copyright © 2022 Musemind <Link href="/">ui/ux design</Link> agency | All rights reserved.
                    </div>
                    <div className={style.copywriteMenu}>
                        <ul>
                            <li>Terms of Service</li>
                            <li>Privacy & Policy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default footer