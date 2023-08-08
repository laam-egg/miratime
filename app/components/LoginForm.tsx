import React from "react";
import "./LoginForm.css";
import LoginFormButtons from "./LoginFormButtons";

export default function LoginForm() {
    return <div className="loginFormContainer">
        <form className="loginForm" id="loginForm">
            <h1>Login</h1>
            <div className="formInputGroup">
                <input className="formControl" type="email" name="emailInput" id="emailInput" placeholder="Email"/>
                <label className="formControl" htmlFor="emailInput"></label>
            </div>
            <div className="formInputGroup">
                <input className="formControl" type="password" name="passwordInput" id="passwordInput" placeholder="Password" />
                <label className="formControl" htmlFor="passwordInput"></label>
            </div>
            <LoginFormButtons />
        </form>
    </div>;
}
