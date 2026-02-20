import React from 'react'
import Link from 'next/link'
import './headerStyle.css'

const header = () => {
  return (
    <div id='header'>
        <div className="container">
            <div className="headerCol1">
                <div className="logo">EduTech</div>
                <button className='exploreTestButton'>
                    Explore Test
                    <div className="exploreTestButtonDropdownMenu">
                        <div className="testTypeList">
                            <ul>
                                <li>Competitive Exams</li>
                                <li>School Preparation</li>
                                <li>School Boards</li>
                                <li>Other</li>
                            </ul>
                        </div>
                    </div>
                </button>
            </div>
            <div className="headerCol2">
                <div className="menuItemContainer">
                    <ul className='menuItem'>
                        <Link href="/" className='item i1'><li>Home</li></Link>
                        <Link href="/" className='item i2'><li>Upsilling</li></Link>
                        <Link href="/" className='item i3'><li>Tests</li></Link>
                        <Link href="/" className='item i4'><li>Product</li></Link>
                        <Link href="/" className='item i5'><li>About</li></Link>
                        <Link href="/contact" className='item i6'><li>Contact</li></Link>
                    </ul>
                </div>
            </div>
            <div className="headerCol3">
                <Link href="/signIn-Register" className='loginRegisterButton'>Sign in/Register</Link>
            </div>
        </div>
    </div>
  )
}

export default header