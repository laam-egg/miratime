import React from "react";

export type FormFieldProps = {
    type: string,
    id: string,
    name: string,
    placeholder?: string,
    label?: string,
    required?: boolean
};

export default function FormField({ id, type, name, placeholder, label, required } : FormFieldProps) {
    return (
        <div className="formInputGroup">
            <input className="formControl" type={type} id={id} name={name} placeholder={placeholder ?? ""} required={required ?? false} />
            <label className="formControl" htmlFor={id}>{label ?? ""}</label>
        </div>
    );
}
