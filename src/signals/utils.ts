
export function isFunction(value: any): value is Function {
  const type = typeof value;
  return !!value && type === 'function';
}
