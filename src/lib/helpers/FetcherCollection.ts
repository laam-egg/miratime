////////////////////////////////////////////////////////////////////////////
////// BEGIN CODE FROM https://jsbin.com/vicemiqiqu/1/edit?js,console //////
////////////////////////////////////////////////////////////////////////////

function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  function mergeDeep(target: any, ...sources: any[]) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {    
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) { 
            Object.assign(target, { [key]: {} });
          }else{          
            target[key] = Object.assign({}, target[key])
          }
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return mergeDeep(target, ...sources);
  }
  
////////////////////////////////////////////////////////////////////////////
/////// END CODE FROM https://jsbin.com/vicemiqiqu/1/edit?js,console ///////
////////////////////////////////////////////////////////////////////////////

import urlJoin from "url-join";

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

export type FetchParams = {
    [key: string]: any
};

export type FetchResource = {
    [key: string|number|symbol]: any
};

export type FetchOptions = RequestInit & { baseUrl?: string };

export type FetchResponse = Response & {
    body: any
};

export type GetFetcher = (url: string, params?: FetchParams, options?: FetchOptions) => Promise<FetchResponse>;
export type PostFetcher = (url: string, resource?: FetchResource, options?: FetchOptions) => Promise<FetchResponse>;
export type PutFetcher = (url: string, resource?: FetchResource, options?: FetchOptions) => Promise<FetchResponse>;
export type PatchFetcher = (url: string, resource?: FetchResource, options?: FetchOptions) => Promise<FetchResponse>;

export type FetcherCollection = {
    get: GetFetcher;
    post: PostFetcher;
    put: PutFetcher;
    patch: PatchFetcher;
};

export type FetcherResponseMiddleware = (res: FetchResponse) => FetchResponse;

/**
 * 
 * @param baseOptions - Options that are available in all calls to the
 *                      fetchers in the returned fetcher collection.
 * 
 *                      Note that the base options take precedence over
 *                      more options specified to the fetchers later on.
 * 
 * @param fetchFunction - An implementation of the Fetch API. Defaults to
 *                        the `fetch` function available in NodeJS and
 *                        the browser running the code.
 * 
 * @param middleware - A middleware used to manipulate the response after
 *                     it is fetched and before it is returned (through
 *                     promise resolving) by any fetcher methods.
 *                     
 *                     This function gets called whenever a response is
 *                     fetched, even if status code is other than 200.
 */
export const createFetcherCollection = (
    baseOptions?: FetchOptions,
    fetchFunction: FetchFunction = fetch,
    middleware: FetcherResponseMiddleware = (res) => res
): FetcherCollection => {
    if (!baseOptions) baseOptions = {};
    baseOptions = mergeDeep({}, baseOptions, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    const patchUrl = (options: FetchOptions, url: string, params?: FetchParams) => {
        let finalUrl = url;
        if (options?.baseUrl !== undefined) {
            finalUrl = urlJoin(options.baseUrl, finalUrl);
        }
        if (params !== undefined) {
            const finalUrlObject = new URL(finalUrl);
            finalUrlObject.search = (new URLSearchParams(params)).toString();
            finalUrl = finalUrlObject.href;
        }
        return finalUrl;
    };

    const patchResource = (_options: FetchOptions, resource?: FetchResource) => {
        if (!resource) return '';
        return JSON.stringify(resource);
    };

    const patchOptions = (options?: FetchOptions): FetchOptions => {
        const result = mergeDeep({}, options ?? {}, baseOptions);
        if (options?.baseUrl && baseOptions?.baseUrl) {
            result.baseUrl = urlJoin(baseOptions.baseUrl, options.baseUrl);
        }
        return result;
    };
    
    const wrapFetchFunctionResponse = (p: Promise<Response>): Promise<FetchResponse> => {
        return new Promise((resolve, reject) => {
            p.then(async (res: Response) => {
                const newRes: FetchResponse = mergeDeep({}, res, {
                    body: await res.json(),
                });
                return newRes;
            })
            .then(middleware)
            .then(resolve)
            .catch(reject);
        });
    };

    const callFetchFunctionWithParams = (method: string, url: string, params?: FetchParams, options?: FetchOptions): Promise<FetchResponse> => {
        const patchedOptions = patchOptions(options);
        patchedOptions.method = method;
        return wrapFetchFunctionResponse(fetchFunction(patchUrl(patchedOptions, url, params), patchedOptions));
    };

    const callFetchFunctionWithResource = (method: string, url: string, resource?: FetchResource, options?: FetchOptions): Promise<FetchResponse> => {
        const patchedOptions = patchOptions(options);
        patchedOptions.method = method;
        patchedOptions.body = patchResource(patchedOptions, resource);
        return wrapFetchFunctionResponse(fetchFunction(patchUrl(patchedOptions, url), patchedOptions));
    };

    return {
        get: (url, params?, options?) => callFetchFunctionWithParams('GET', url, params, options),
        post: (url, resource?, options?) => callFetchFunctionWithResource('POST', url, resource, options),
        put: (url, resource?, options?) => callFetchFunctionWithResource('PUT', url, resource, options),
        patch: (url, resource?, options?) => callFetchFunctionWithResource('PATCH', url, resource, options),
    };
};
