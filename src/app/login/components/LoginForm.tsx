import React from "react";
import LoginFormButtons from "./LoginFormButtons";
import FormField from "@/lib/components/FormField";

export default function LoginForm() {
    return <div className="mainFormContainer">
        <form className="mainForm" id="loginForm">
            <h1>Log in</h1>
            <FormField type="email" id="emailInput" placeholder="Email" required={true} />
            <FormField type="password" id="passwordInput" placeholder="Password" required={true} />
            <LoginFormButtons />
        </form>
    </div>;
}
