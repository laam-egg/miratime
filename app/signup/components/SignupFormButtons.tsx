'use client';

import React from "react";
import Link from "next/link";

export default function SignupFormButtons() {
    const signup = () => {
        alert("Sign up");
    };

    return <div className="formInputGroup">
        <input type="button" className="formControl buttonPrimary" onClick={signup} value="Sign up" />
        <div className="formControl" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Already have an account ?</span>
            <span><Link href="/login">Log in</Link></span>
        </div>
    </div>
}
