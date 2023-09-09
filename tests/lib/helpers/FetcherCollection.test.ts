/**
 * Test get/post/put/patch
 * Test base options, including deep properties
 * Test middleware
 * Test custom fetch function
 */

import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { FetchOptions, FetchParams, FetchResponse, createFetcherCollection } from '@/lib/helpers/FetcherCollection';
import urlJoin from 'url-join';
const express = require('express');

type BeforeAllFunctionType = (done: Function) => void;
type AfterAllFunctionType = (done: Function) => void;

const useTestServer = (port: number): [string, BeforeAllFunctionType, AfterAllFunctionType] => {
    let server = express();

    const beforeAllFunction: BeforeAllFunctionType = (done: Function) => {
        server.use(express.json());

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

        server.use('/', (req: any, res: any, next: any) => {
            res.status(404).json({ status: 404, message: 'ROUTE_NOT_FOUND' });
        });

        server.listen(port, (err: any) => {
            if (err) done(err);
            done();
        });
    };

    const afterAllFunction: AfterAllFunctionType = (done: Function) => {
        return server && server.close ? server.close(done) : done();
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
        console.log(body.headers);
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
    })
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
    });

    it('should do basic POST', async () => {
        const url = urlJoin('http://localhost:3004', '/success/', '/subroute');
        expect(url).toBe('http://localhost:3004/success/subroute');
        new URL(url);
    });
});
