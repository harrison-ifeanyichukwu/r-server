const singleToken = '\\{((?:[a-z]+:)?[a-z]+)\\}';

export const SINGLE_TOKEN_REGEX = new RegExp(singleToken, 'i');
export const DOUBLE_TOKEN_REGEX = new RegExp(singleToken + '([-.])' + singleToken, 'i');

export const ERROR_LEVELS = {
  WARNING: 'WARNING',
  FATAL: 'FATAL',
};

export const ALLOWED_METHODS = ['OPTIONS', 'HEAD', 'GET', 'POST'];

export const CRLF = '\r\n';

export const BLANK_LINE = CRLF + CRLF;

let routeId = 0;
let middlewareId = 0;

export const assignRouteId = () => ++routeId;

export const assignMiddlewareId = () => ++middlewareId;
