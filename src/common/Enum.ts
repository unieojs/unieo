export enum RouteStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum GroupProcessorType {
  // 通用分组处理器
  COMMON_GROUP_PROCESSOR = 'COMMON_GROUP_PROCESSOR',
}

export enum SubProcessorType {
  // 通用处理器
  COMMON_SUB_PROCESSOR = 'COMMON_SUB_PROCESSOR',
}

export enum RouteType {
  // AUTH 分组
  AUTH_GROUP_ROUTE = 'AUTH_GROUP_ROUTE',
  // 灰度分组
  GREY_GROUP_ROUTE = 'GREY_GROUP_ROUTE',
}

export enum MatchOperator {
  AND = 'and',
  OR = 'or',
}

export enum ValueSourceType {
  // 字面值，value 为实际值
  LITERAL = 'literal',
  // 请求头
  REQUEST_HEADER = 'request_header',
  // 响应头
  RESPONSE_HEADER = 'response_header',
  // 响应码
  RESPONSE_STATUS = 'response_status',
  // cookie
  COOKIE = 'cookie',
  // url
  URL = 'url',
  // 原始 URL
  ORIGIN_URL = 'origin_url',
  // query
  QUERY = 'query',
  // method
  METHOD = 'method',
  // fetch
  FETCH = 'fetch',
  // args
  ROUTE_ARGS = 'route_args',
  // 字符串模板
  STRING_TEMPLATE = 'string_template',
  // 嵌套 value
  VALUE_OBJECT = 'value_object',
}

export enum Operator {
  IN = 'in',
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  NOT_IN = 'not_in',
  NULL = 'null',
  NOT_NULL = 'not_null',
  REGEXP = 'regexp',
  // 正则取反
  NOT_REGEXP = 'not_regexp',
  PATH_REGEXP = 'path_regexp',
  // 路径正则取反
  NOT_PATH_REGEXP = 'not_path_regexp',
  GTE = 'gte',
  GT = 'gt',
  LTE = 'lte',
  LT = 'lt',
  PREFIX = 'prefix',
  NOT_PREFIX = 'not_prefix',
  SUFFIX = 'suffix',
  NOT_SUFFIX = 'not_suffix',
  NAN = 'nan',
  NUMBER = 'number',
  KEY_OF = 'key_of',
}

export enum RequestRewriteType {
  HEADER = 'header',
  URL = 'url',
  QUERY = 'query',
  REQUEST_INIT = 'request_init',
  MIDDLEWARE = 'middleware',
}

export enum ResponseRewriteType {
  HEADER = 'header',
}

export enum ResponseRewriteOperation {
  SET = 'set',
  APPEND = 'append',
  DELETE = 'delete',
}

export enum RewriteOperation {
  SET = 'set',
  APPEND = 'append',
  DELETE = 'delete',
}

export enum UrlValueType {
  HREF = 'href',
  PATH = 'path',
  HOST = 'host',
  SUFFIX = 'suffix',
}

export enum RequestInitValueType {
  CDN_PROXY = 'cdnProxy',
  MIDDLEWARE = 'middleware',
}

export enum RedirectType {
  URL = 'url',
  PATH = 'path',
  PATH_REGEXP = 'path_regexp',
  PATH_PREFIX = 'path_prefix',
  HOST = 'host',
}

/**
 * 解压类型
 */
export enum DecompressType {
  MANUAL = 'manual',
  FALLBACK_IDENTITY = 'fallbackIdentity',
}

export enum ValueType {
  JSON = 'json',
  STRING = 'string',
  // 版本号，如 10.5.70.8000
  VERSION_STRING = 'version_string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  // 路由的 match 逻辑
  MATCH = 'match',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE',
}

export enum HttpStatus {
  FORBIDDEN = 403,
  METHOD_NOT_ALLOWED = 405,
}
