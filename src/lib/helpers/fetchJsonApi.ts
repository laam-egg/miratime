'use client';

import { FetchJson, FetchJsonOptions, FetchJsonParams, fetchJson } from 'fetch-json';
import { API_BASE_URL } from '@/lib/helpers/env';

class FetchJsonApi {
    private fj: typeof fetchJson;
    private baseUrl: string;
    private accessToken: string | null;

    private readonly commonBaseOptions = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    constructor() {
        this.fj = new FetchJson().fetchJson;
        this.fj.setBaseOptions({
            headers: Object.assign({}, this.commonBaseOptions, {})
        });
        this.baseUrl = (API_BASE_URL as string);
        this.accessToken = null;
    }

    setAccessToken(accessToken: string): void {
        this.accessToken = accessToken;
        this.fj.setBaseOptions({
            headers: Object.assign({}, this.commonBaseOptions, {
                'Authorization': `Bearer ${this.accessToken}`
            })
        });
    }

    unsetAccessToken(): void {
        this.accessToken = null;
        this.fj.setBaseOptions({
            headers: Object.assign({}, this.commonBaseOptions, {})
        });
    }

    hasAccessToken(): boolean {
        return this.accessToken !== null;
    }

    getAccessToken(): string | null {
        // TODO: Should exception be thrown here ?
        return this.accessToken;
    }

    private produceUrl(path: string): string {
        const url = new URL(path, this.baseUrl).href;
        return url;
    }

    private qualifyParams(params?: FetchJsonParams | undefined) {
        return params;
    }

    private qualifyOptions(options?: FetchJsonOptions | undefined) {
        if (!options) {
            options = {};
        }

        if (!options.headers) {
            options.headers = {};
        }

        Object.assign(options.headers, {
            'X-MIRATIME-XSRF-PROTECTION': '1'
        });

        return options;
    }

    private trapPromise(p: Promise<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            p
            .then((data) => {
                if (data.ok === false && data.error === true) {
                    if (data.status == 401 && data.data.message == 'UNAUTHENTICATED') {
                        // TODO: See GitHub repo issue #1
                    }
                    reject(data.data);
                } else {
                    resolve(Object.assign({
                        status: 200
                    }, data));
                }
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    get(
        path: string,
        params?: FetchJsonParams | undefined,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.get(this.produceUrl(path), this.qualifyParams(params), this.qualifyOptions(options))
        );
    }

    post(
        path: string,
        resource?: any,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.post(this.produceUrl(path), resource, this.qualifyOptions(options))
        );
    }

    put(
        path: string,
        resource?: any,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.put(this.produceUrl(path), resource, this.qualifyOptions(options))
        );
    }

    patch(
        path: string,
        resource?: any,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.patch(this.produceUrl(path), resource, this.qualifyOptions(options))
        );
    }

    delete(
        path: string,
        resource?: any,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.delete(this.produceUrl(path), resource, this.qualifyOptions(options))
        );
    }

    head(
        path: string,
        params?: FetchJsonParams | undefined,
        options?: FetchJsonOptions | undefined
    ): Promise<any> {
        return this.trapPromise(
            this.fj.head(this.produceUrl(path), this.qualifyParams(params), this.qualifyOptions(options))
        );
    }
}

const fetchJsonApi = new FetchJsonApi();

export { fetchJsonApi, FetchJsonApi };
