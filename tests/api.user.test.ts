import {expect, jest, test} from '@jest/globals';
import api from "./api";

test("basic api", async () => {
    const res = await api.post("/auth/login", {
        email: "1234"
    });
    expect(res.status).toBe(200);
    const { email2, password2 } = await res.json();
    expect(email2).toBe("1234");
    expect(password2).toBe(undefined);
});
