import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { hasKey } from '../util'

export interface Record<O extends {[_ in string]: Rt }> extends Runtype<{[K in keyof O]: Static<O[K]> }> {
  tag: 'record'
  fields: O
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function Record<O extends { [_: string]: Rt }>(fields: O) {
  return create<Record<O>>(x => {
    if (x === null || x === undefined)
      throw validationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in fields) {
      if (hasKey(key, x)) {
        try {
          fields[key].check(x[key])
        } catch ({ message }) {
          throw validationError(`In key ${key}: ${message}`)
        }
      } else {
        const reflect = fields[key] as any;
        if (reflect.tag && reflect.tag === "union") {
          const alternatives: any[] = reflect.alternatives;
          const foundUndefined = alternatives.filter((a) => a.tag === "literal" && a.value === undefined);
          if (foundUndefined.length === 0) {
            throw validationError(`Missing property '${key}'`)
          }
        } else {
          throw validationError(`Missing property '${key}'`)
        }

      }
    }

    return x as O
  }, { tag: 'record', fields })
}
