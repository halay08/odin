import { FormField } from '../components/FormModal/FormFields';

export function arrayHasValues(array: any): boolean {
  return !!array && array.length > 0;
}


export function itemExistsInArrayOfObjects(array: any, itemId: string, key: string): boolean {
  console.log('array', array);
  if(!!array && array.length > 0) {
    const findInArray = array.find((elem: { [key: string]: any }) => elem[key] === itemId);
    return !!findInArray;
  }
  return false;
}


/**
 * For Checkbox form fields
 * @param field
 */
export function setIsChecked(field: FormField): boolean {

  // if the initialValue is a string but should be a boolean we handle the
  // conditionals here.
  if(field.initialValue && typeof field.initialValue === 'string') {

    if(field.initialValue.toLowerCase() === 'true') {

      return true;
    } else if(field.initialValue.toLowerCase() === 'false') {

      return false

    }

  } else if(field.defaultValue && typeof field.defaultValue === 'string') {

    if(field.defaultValue.toLowerCase() === 'true') {

      return true;
    } else if(field.defaultValue.toLowerCase() === 'false') {

      return false

    }

    return false;

  }

  if(field.initialValue) {
    return Boolean(field.initialValue);
  } else {
    return Boolean(field.defaultValue);
  }

}



