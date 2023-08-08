import React from "react";

export type FormFieldProps = {
    type: string,
    id: string,
    placeholder?: string,
    label?: string,
    required?: boolean
};

export default function FormField({ id, type, placeholder, label, required } : FormFieldProps) {
    return (
        <div className="formInputGroup">
            <input className="formControl" type={type} id={id} name={id} placeholder={placeholder ?? ""} required={required ?? false} />
            <label className="formControl" htmlFor={id}>{label ?? ""}</label>
        </div>
    );
}
