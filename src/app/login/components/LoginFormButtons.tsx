'use client';

import React from "react";
import Link from "next/link";

export default function LoginFormButtons() {
    const login = () => {
        alert("Login");
    };

    const forgotPassword = () => {
        alert("Forgot Password");
    };

    const signup = () => {
        alert("Signup");
    };

    return (
        <div className="formInputGroup">
            <input type="button" className="formControl buttonPrimary" onClick={login} value="Log in" />
            <input type="button" className="formControl buttonSecondary" onClick={forgotPassword} value="Forgot Password" />
            <div className="formControl" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Don't have an account ?</span>
                <span><Link href="/signup">Sign up</Link></span>
            </div>
        </div>
    );
}
