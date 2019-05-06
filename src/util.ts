export enum METHOD {
    get = 'GET',
    post = 'POST',
    put = 'PUT',
    delete = 'DELETE',
    head = 'HEAD',
    patch = 'PATCH',
}

export enum HTTP_STATUS_CODE {
    ok = 200,
    created = 201,
    accepted = 202,
    noContent = 204,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    unProcessableEntity = 422,
    serviceError = 500,
    badGateWay = 502,
    serviceUnavailable = 503,
}
