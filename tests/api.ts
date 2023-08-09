import { URLSearchParams } from "url";
import { jest } from "@jest/globals";

const api = (function () {
    const fetchAPI = (method: string, relativePath: string, jsonBody: Record<string, any>): Promise<Response> => {
        let url = `${process.env.SERVER_ADDRESS}/api/${relativePath}`;
        const options: RequestInit = {
            method,
            headers: {
                "Accept": "application/json"
            },
        };

        if (method === "GET") {
            url += "?" + (new URLSearchParams(jsonBody as Record<string, any>)).toString();
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(jsonBody);
        }

        return fetch(url, options);
    };

    type requestFunction = (relativePath: string, jsonBody: object) => Promise<Response>;

    const api_: {
        get: requestFunction,
        post: requestFunction,
        put: requestFunction,
        patch: requestFunction
    } = {
        get: (...args) => fetchAPI("GET", ...args),
        post: (...args) => fetchAPI("POST", ...args),
        put: (...args) => fetchAPI("PUT", ...args),
        patch: (...args) => fetchAPI("PATCH", ...args)
    };

    return api_;
})();

export default api;
