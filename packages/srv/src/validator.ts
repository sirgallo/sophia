type ValidField = 'boolean' | 'number' | 'string' | 'object'

export class RouteRequestValidators {
  static isEmptyArray = <T>(arg?: T[]): boolean => {
    const isNull = RouteRequestValidators.__isNullOrUndefined(arg)
    if (isNull) return true

    return arg?.length === 0
  }

  static isEmptObject = <T>(arg?: T) => {
    const isNull = RouteRequestValidators.__isNullOrUndefined(arg)
    if (isNull) return true

    const invalidType = RouteRequestValidators.isInvalidType('object', arg)
    if (invalidType) return true

    if (arg) return Object.keys(arg).length === 0
  }

  static isInvalidType = <T>(type: ValidField, arg?: T): boolean => {
    const isNull = RouteRequestValidators.__isNullOrUndefined(arg)
    if (isNull) return true

    return typeof arg !== type
  }

  static isNotPresent = <T extends object>(field: keyof T, req: T): boolean => {
    return !(field in req)
  }

  private static __isNullOrUndefined = <T>(arg?: T): boolean => {
    return arg === null || arg === undefined
  }
}
