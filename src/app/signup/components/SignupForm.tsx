import React from "react";
import FormField from "@/lib/components/FormField";
import SignupFormButtons from "./SignupFormButtons";

export default function SignupForm() {
    return <div className="mainFormContainer">
    <form className="mainForm" id="signupForm">
        <h1>Sign up</h1>
        <FormField type="text" id="fullNameInput" name="name" placeholder="Full Name" required={true} />
        <FormField type="email" id="emailInput" name="email" placeholder="Email" required={true} />
        <FormField type="password" id="passwordInput" name="password" placeholder="Password" required={true} />
        <FormField type="password" id="retypePasswordInput" name="retypedPassword" placeholder="Retype Password" required={true} />
        <SignupFormButtons />
    </form>
    </div>;
}
