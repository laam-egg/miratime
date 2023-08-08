'use client';

import React from "react";
import "./LoginForm.css";
import "./LoginFormButtons.css";

export default function LoginFormButtons() {
    const login = () => {
        alert("Login");
    };

    const signup = () => {
        alert("Signup");
    };

    return (
        <div className="formInputGroup">
            <input type="button" className="formControl buttonPrimary" onClick={login} value="Login" />
            <input type="button" className="formControl buttonSecondary" onClick={signup} value="Signup" />
        </div>
    );
}
