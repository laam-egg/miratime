/**
 * Test get/post/put/patch
 * Test base options, including deep properties
 * Test middleware
 * Test custom fetch function
 */

import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { FetchFunction, FetchOptions, FetchParams, FetchResponse, createFetcherCollection } from '@/lib/helpers/FetcherCollection';
import urlJoin from 'url-join';
const express = require('express');
import cookieParser from 'cookie-parser';

type BeforeAllFunctionType = (done: Function) => void;
type AfterAllFunctionType = (done: Function) => void;

const useTestServer = (port: number): [string, BeforeAllFunctionType, AfterAllFunctionType] => {
    let server = express();
    let httpServer: any;

    //  BEGIN CODE FROM https://stackoverflow.com/a/10727155/13680015  //
    /////////////////////////////////////////////////////////////////////
    function randomString(length: number, chars: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    //////////////////////////// END CODE ///////////////////////////////

    let secureCookieValue = randomString(64);

    const beforeAllFunction: BeforeAllFunctionType = (done: Function) => {
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));
        server.use(cookieParser());

        server.all('/success/:subroute', (req: any, res: any) => {
            res.status(200).json({
                request: `${req.method} /success/${req.params['subroute']}`,
                query: req.query,
                body: req.body ?? null,
                headers: req.headers,
            });
        });

        server.all('/failure/:status(\\d+)/:subroute', (req: any, res: any) => {
            let originalStatus = req.params['status'];
            let status = originalStatus;
            if (!isNaN(+status)) status = +status;
            else status = 400;
            res.status(status ? status : 400).json({
                request: `${req.method} /failure/${originalStatus}/${req.params['subroute']}`,
                query: req.query,
                body: req.body ?? null,
                headers: req.headers,
            });
        });

        server.all('/setsecurecookie', (req: any, res: any) => {
            res.cookie('biscuit', secureCookieValue, {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: 1000*180, // 180 seconds
            });
            res.status(200).json({});
        });

        server.all('/checksecurecookie', (req: any, res: any) => {
            const { biscuit } = req.cookies;
            if (biscuit !== secureCookieValue) {
                res.status(400).json({ status: 400, message: 'COOKIE_INVALID' });
            } else {
                res.status(200).json({});
            }
        });

        server.all('/resetsecurecookie', (req: any, res: any) => {
            secureCookieValue = randomString(64);
            res.status(200).json({});
        });

        server.use('/', (req: any, res: any, next: any) => {
            res.status(404).json({ status: 404, message: 'ROUTE_NOT_FOUND' });
        });

        httpServer = server.listen(port, (err: any) => {
            if (err) done(err);
            done();
        });
    };

    const afterAllFunction: AfterAllFunctionType = (done: Function) => {
        httpServer.close(done);
    };

    return [`http://localhost:${port}`, beforeAllFunction, afterAllFunction];
};

describe('Test server created by `useTestServer`', () => {
    const PORT = 3003;
    const [serverUrl, beforeAllFunction, afterAllFunction] = useTestServer(PORT);
    beforeAll(beforeAllFunction);
    afterAll(afterAllFunction);

    it('should return valid URL and play well with urlJoin', () => {
        expect([
            `http://localhost:${PORT}`,
            `http://localhost:${PORT}/`,
        ]).toContain(serverUrl);

        for (const [subroutes, expected] of [
            [['/success/subroute', '/subsubroute'], `http://localhost:${PORT}/success/subroute/subsubroute`],
            [['/success/subroute', '123'], `http://localhost:${PORT}/success/subroute/123`],
            [['/success', '123'], `http://localhost:${PORT}/success/123`],
            [['/success/', '123'], `http://localhost:${PORT}/success/123`],
            [['/success', '/123'], `http://localhost:${PORT}/success/123`],
            [['/success/', '/123'], `http://localhost:${PORT}/success/123`],
            [['/success/', '/123/'], `http://localhost:${PORT}/success/123/`],
            [['/success', '/a', '/b', '/c'], `http://localhost:${PORT}/success/a/b/c`]
        ] as Array<[string[], string]>) {
            expect(urlJoin(serverUrl, ...subroutes)).toBe(expected);
        }

        expect([
            `http://localhost:${PORT}/success/123`,
            `http://localhost:${PORT}/success/123/`,
        ]).toContain(urlJoin(serverUrl, '/success/', '/123/'));
    });

    it('should handle /success/:subroute routes', async () => {
        const res = await fetch(urlJoin(serverUrl, '/success/abc'), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.request).toBe('GET /success/abc');
        expect(body.query).toEqual({});
        expect(body.body).toEqual({});
        expect(body.headers.accept).toBe('application/json');
    });

    it('should emit 404 if route not handled', async () => {
        const res = await fetch(urlJoin(serverUrl, '/route_not_handled'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ abc: 'def' }),
        });
        expect(res.status).toBe(404);
    });

    // THE FOLLOWING TEST CAN ONLY BE RUN IN BROWSER CONTEXT
    // it('should be able to set secure, httpOnly cookie', async () => {
    //     const options: RequestInit = {
    //         method: 'GET',
    //         credentials: 'include'
    //     };
    //     const checksecurecookie = urlJoin(serverUrl, '/checksecurecookie');
    //     const setsecurecookie = urlJoin(serverUrl, '/setsecurecookie');
    //     const resetsecurecookie = urlJoin(serverUrl, '/resetsecurecookie');

    //     let res = await fetch(checksecurecookie, options);
    //     expect(res.status).toBe(400);

    //     res = await fetch(setsecurecookie, options);
    //     expect(res.status).toBe(200);

    //     res = await fetch(checksecurecookie, options);
    //     expect(res.status).toBe(200);

    //     res = await fetch(resetsecurecookie, options);
    //     expect(res.status).toBe(200);

    //     res = await fetch(checksecurecookie, options);
    //     expect(res.status).toBe(400);

    //     res = await fetch(setsecurecookie, options);
    //     res = await fetch(resetsecurecookie, options);
    //     res = await fetch(checksecurecookie, options);
    //     expect(res.status).toBe(400);
    // });
});

describe('A fetcher collection returned by createFetcherCollection', () => {
    const [serverUrl, beforeAllFunction, afterAllFunction] = useTestServer(3004);
    beforeAll(beforeAllFunction);
    afterAll(afterAllFunction);

    it('should do basic GET', async () => {
        let res: FetchResponse = await createFetcherCollection().get(urlJoin(serverUrl, '/success/abc'));
        expect(res.status).toBe(200);
        expect(res.body.request).toBe('GET /success/abc');
        expect(res.body.query).toStrictEqual({});
        expect(res.body.body).toEqual({});

        const query: FetchParams = { x: '1', y: 'abc' };
        res = await createFetcherCollection().get(urlJoin(serverUrl, '/success/def'), query);
        expect(res.status).toBe(200);
        expect(res.body.query).toStrictEqual(query);

        const options: FetchOptions = {
            baseUrl: urlJoin(serverUrl, '/success/'),
            headers: {
                'Authorization': 'Bearer 123456789',
            },
        };
        res = await createFetcherCollection().get('/subroute', query, options);
        expect(res.status).toBe(200);
        expect(res.body.request).toBe('GET /success/subroute');
        expect(res.body.headers.authorization).toBe('Bearer 123456789');

        res = await createFetcherCollection({
            baseUrl: serverUrl
        }).get('/failure/405/subroute');
        expect(res.status).toBe(405);
        expect(res.body.request).toBe('GET /failure/405/subroute');
    });

    it('should do basic POST, PUT and PATCH', async () => {
        let body = {
            a: 1,
            b: {
                c: {
                    d: 2
                }
            }
        };

        const fc = createFetcherCollection({
            baseUrl: serverUrl,
        });
        let res: FetchResponse = await fc.post('/success/123');
        expect(res.status).toBe(200);
        expect(res.body.request).toBe('POST /success/123');
        expect(res.body.body).toEqual({});

        res = await fc.put('/success/345', body);
        expect(res.status).toBe(200);
        expect(res.body.request).toBe('PUT /success/345');
        expect(res.body.body).toEqual(body);

        res = await fc.patch('/failure/401/402', body);
        expect(res.status).toBe(401);
        expect(res.body.request).toBe('PATCH /failure/401/402');
        expect(res.body.body).toEqual(body);
    });

    it('should concatenate base URLs found in both baseOptions and more options', async () => {
        const baseOptions: FetchOptions = {
            baseUrl: serverUrl,
        };
        const additionalOptions: FetchOptions = {
            baseUrl: '/failure/409',
        };

        const fc = createFetcherCollection(baseOptions);
        const body = {};
        let res = await fc.post('/abc', body, additionalOptions);
        expect(res.status).toBe(409);
        expect(res.body.request).toBe('POST /failure/409/abc');
        expect(res.body.body).toEqual({});
    });

    it('should merge options (except base URLs) found in both baseOptions and additional options', async () => {
        const baseOptions: FetchOptions = {
            headers: {
                'Authorization': 'Bearer 123456',
            },
            credentials: 'include',
        };
        const additionalOptions: FetchOptions = {
            headers: {
                'Content-Language': 'en-US',
            },
            baseUrl: serverUrl,
        };
        const fc = createFetcherCollection(baseOptions);
        let res = await fc.post('/success/123', {}, additionalOptions);
        expect(res.status).toBe(200);
        expect(res.body.body).toEqual({});
        expect(res.body.headers.authorization).toBe('Bearer 123456');
        expect(res.body.headers['content-language']).toBe('en-US');

        // THE FOLLOWING TEST CAN ONLY BE RUN IN BROWSER CONTEXT
        // CHECK SECURE COOKIE (and therefore check the `credentials` option)
        // res = await fc.get('/setsecurecookie', {}, additionalOptions);
        // expect(res.status).toBe(200);

        // res = await fc.get('/checksecurecookie', {}, additionalOptions);
        // expect(res.status).toBe(200);

        // res = await fc.get('/resetsecurecookie', {}, additionalOptions);
        // expect(res.status).toBe(200);

        // res = await fc.get('/checksecurecookie', {}, additionalOptions);
        // expect(res.status).toBe(401);
    });

    it('should prioritize baseOptions over additional options', async () => {
        const baseOptions: FetchOptions = {
            headers: {
                'Authorization': 'Bearer <base-options>',
            },
            baseUrl: serverUrl,
        };
        const additionalOptions: FetchOptions = {
            headers: {
                'Authorization': 'Bearer <additional-options>',
            },
        };

        let res = await createFetcherCollection(baseOptions).post('/success/123', {}, additionalOptions);
        expect(res.status).toBe(200);
        expect(res.body.headers.authorization).toBe('Bearer <base-options>');
    });

    it('should keep JSON-related base options regardless of additional options', async () => {
        const baseOptions: FetchOptions = {
            headers: {
                'Content-Type': 'text/plain',
            },
            baseUrl: serverUrl,
        };
        const additionalOptions: FetchOptions = {
            headers: {
                'Accept': 'text/html',
            },
        };
        let res = await createFetcherCollection(baseOptions).put('/success/123', {}, additionalOptions);
        expect(res.status).toBe(200);
        expect(res.body.headers['content-type']).toBe('application/json');
        expect(res.body.headers.accept).toBe('application/json');
    });

    it('should use custom fetch function if specified', async () => {
        const ff: FetchFunction = async (_input, _init) => {
            // This is a mock Response object.
            const baseRes = {
                ok: true,
                redirected: false,
                status: 200,
                statusText: 'success',
                type: 'basic',
                url: 'random-url',

                body: null,
                bodyUsed: true,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
                json: async () => ({}),
                text: async () => '',
            };
            const clone = (): Response => {
                const t = {
                    // Put the Headers instance here, and rebind its methods later to avoid TypeError: Illegal invocation (https://www.google.com/search?q=js+illegal+invocation&sca_esv=564140824&sxsrf=AB5stBgbWIQHHljKKMx3z16pp1xWyq_ivA%3A1694343009553&ei=YZ_9ZITQIIbd2roP7pGW8Ak&ved=0ahUKEwjEhNjJ75-BAxWGrlYBHe6IBZ4Q4dUDCBA&uact=5&oq=js+illegal+invocation&gs_lp=Egxnd3Mtd2l6LXNlcnAiFWpzIGlsbGVnYWwgaW52b2NhdGlvbkjLAlAAWM4BcAB4AZABAJgBAKABAKoBALgBA8gBAPgBAeIDBBgAIEGIBgE&sclient=gws-wiz-serp#:~:text=An%20%22illegal%20invocation%22%20error%20is%20thrown%20when%20calling%20a%20function%20whose%20this%20keyword%20doesn%27t%20refer%20to%20the%20object%20where%20it%20originally%20did.%20In%20other%20words%2C%20the%20original%20%22context%22%20of%20the%20function%20is%20lost.)
                    headers: new Headers({
                        'x-random-header': '123456789',
                    }),
                };
                for (const funcName of [
                    // All public functions of Headers object from [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers#instance_methods)
                    'append',
                    'delete',
                    'entries',
                    'forEach',
                    'get',
                    'getSetCookie',
                    'has',
                    'keys',
                    'set',
                    'values',
                ]) {
                    eval(`t.headers.${funcName} = t.headers.${funcName}.bind(t.headers)`);
                }
                return Object.assign(t, baseRes, { clone }) as Response;
            };

            return clone();
        };

        const fc = createFetcherCollection({}, ff);
        let res = await fc.get('');
        expect(res.status).toBe(200);
        expect(res.headers.get('x-random-header')).toBe('123456789');
        expect(res.ok).toBe(true);
        expect(res.url).toBe('random-url');
        expect(await res.json()).toEqual({});
    });

    it('should use middleware if specified', async () => {
        const fc = createFetcherCollection({
            baseUrl: serverUrl,
        }, fetch, (res: FetchResponse) => {
            res.body = 1;
            return res;
        });

        let res = await fc.get('/success/abc');
        expect(res.status).toBe(200);
        expect(res.body).toBe(1);
    });
});
