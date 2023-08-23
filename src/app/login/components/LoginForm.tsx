import React from "react";
import LoginFormButtons from "./LoginFormButtons";
import FormField from "@/lib/components/FormField";

export default function LoginForm() {
    return <div className="mainFormContainer">
        <form className="mainForm" id="loginForm">
            <h1>Log in</h1>
            <FormField type="email" id="emailInput" name="email" placeholder="Email" required={true} />
            <FormField type="password" id="passwordInput" name="password" placeholder="Password" required={true} />
            <LoginFormButtons />
        </form>
    </div>;
}
