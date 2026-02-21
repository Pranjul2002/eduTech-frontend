"use client";

import React, { useEffect, useState } from 'react';
import style from './profile.module.css'


const page = () => {

    const [user, setUser] = useState(null);

    /*useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:8080/api/user/me", {
                headers: {
                "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setUser(data);
        };
        fetchUser();
    }, []);*/




    return (
        <div id={style.userProfile}>
            <div className={style.userProfileContainer}>
                <div className={style.userImage}></div>
                <div className={style.userInfoContainer}></div>
            </div>
        </div>
    )
}

export default page