'use strict';

import { FormArray, FormControl, FormGroup } from "@angular/forms";
import * as moment from "moment";

// export const BACKEND_URL = 'http://localhost:3000'; //# LOCAL NODEJS SERVER
// export const BACKEND_URL = 'https://dev8.ivantechnology.in/grse'; //# DEV NODEJS SERVER
// export const BACKEND_URL = 'https://grse1.dev13.ivantechnology.in'; //# TESTING DEV PYTHON SERVER
// export const BACKEND_URL = 'http://grse.dev13.ivantechnology.in'; //# DEV PYTHON SERVER
// export const BACKEND_URL = 'http://10.181.111.60'; //# GRSE PRODUCTION PYTHON SERVER
export const BACKEND_URL = 'http://127.0.0.1:5000'; //# GRSE DEV PYTHON SERVER

// export const ALPETA_IP = '14.140.119.59:9004'; //# DEV ALPETA SERVER
// export const ALPETA_IP = '192.168.1.116:9004'; //# IVAN LOCAL ALPETA SERVER
export const ALPETA_IP = '10.181.111.61:9004'; //# GRSE PRODUCTION ALPETA SERVER

export const FAKEAPI_URL = 'https://mocki.io/v1' //# https://mocki.io/fake-json-api

// export const BATCHPROCESSAPI_URL = 'https://grsebatchprocess.dev13.ivantechnology.in' //# IVAN DEV BATCHPROCESS PYTHON SERVER
export const BATCHPROCESSAPI_URL = 'http://10.181.111.60:8130' //# GRSE PRODUCTION BATCHPROCESS PYTHON SERVER

export const AppName = 'GRSE Attendance and Access Control System';
export const TableLength = 10;

export function showValidationMessage(result: any[]) {
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const element = result[key];
      if (element.message) {
        return element.message;
      }
    }
  }

  return "Validation Error: Please check all the fields correctly";
}

export function showServerErrorMessage(err: any) {
  if (err.status == 401) {
    if (err?.error?.['AUTH ERROR']) {
      return err?.error?.['AUTH ERROR'] ?? "Unauthorized Action";
    }

    return err.error.message;
  } else if (err.status == 404) {
    return err.message;
  } else {
    return "Internal server error occured. Please try again later";
  }
}

export function loadCustomScripts(strict: any = "none") {
  var loadScripts: any = {
    pluginsScript: "assets/plugins/global/plugins.bundle.js",
    mainScript: "assets/js/scripts.bundle.js",
    customScript: "assets/js/custom.bundle.js",
  };

  if (strict == "none") {
    for (const [key, value] of Object.entries(loadScripts)) {
      let existImportScript = document.getElementById(key);
      if (existImportScript) {
        existImportScript.remove();
      }

      let val: any = value;

      let importScript = document.createElement('script');
      importScript.setAttribute('src', val);
      importScript.setAttribute('id', key);
      document.head.appendChild(importScript);
    }
  } else {
    const key: any = strict;
    const value: any = loadScripts[strict];

    let existImportScript = document.getElementById(key);
    if (existImportScript) {
      existImportScript.remove();
    }

    let importScript = document.createElement('script');
    importScript.setAttribute('src', value);
    importScript.setAttribute('id', key);
    document.head.appendChild(importScript);
  }
}

export function scrollToQuery(query: any) {
  let $_errFormControl = document.querySelectorAll(query);
  if ($_errFormControl.length > 0) {
    const firstErr: Element = $_errFormControl[0];
    firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function formatTime(customtime: any) {
  let date = new Date(customtime);
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();//prints expected format.
}

export function parseDate(date: any) {
  return moment(date).parseZone().format("YYYY-MM-DDTHH:mm:ss")
}

export function getTimeDifference(date1: any, date2: any) {
  // get total seconds between the times
  var delta = Math.abs(date1 - date2) / 1000;

  // calculate (and subtract) whole days
  var daysDifference = Math.floor(delta / 86400);
  delta -= daysDifference * 86400;

  // calculate (and subtract) whole hours
  var hoursDifference = Math.floor(delta / 3600) % 24;
  delta -= hoursDifference * 3600;

  // calculate (and subtract) whole minutes
  var minutesDifference = Math.floor(delta / 60) % 60;
  delta -= minutesDifference * 60;

  // what's left is seconds
  var secondsDifference = delta % 60;  // in theory the modulus is not required

  return {
    "daysDifference": daysDifference,
    "hoursDifference": hoursDifference,
    "minutesDifference": minutesDifference,
    "secondsDifference": secondsDifference,
  }
}

export function ageCalculator(dateString: string) {
  var today = new Date();
  var DOB = new Date(dateString);
  var totalMonths = (today.getFullYear() - DOB.getFullYear()) * 12 + today.getMonth() - DOB.getMonth();

  totalMonths += today.getDay() < DOB.getDay() ? -1 : 0;
  var years = today.getFullYear() - DOB.getFullYear();

  if (DOB.getMonth() > today.getMonth()) years = years - 1;
  else if (DOB.getMonth() === today.getMonth())
    if (DOB.getDate() > today.getDate()) years = years - 1;

  return years;
}

/**
 * ----------------------------------------
 * Form Control Global Functions
 * @param formGroup - Instance of FormGroup
 * ----------------------------------------
 * ----------------------------------------
 */

export function resetForm(formGroup: FormGroup, resetFormGroup: boolean = true) {
  if (resetFormGroup)
    formGroup.reset();

  for (const key in formGroup.controls) {
    if (Object.prototype.hasOwnProperty.call(formGroup.controls, key)) {
      const element = formGroup.controls[key];

      element.markAsUntouched();
      element.markAsPristine();
    }
  }
}

export function isFormValidationAvailable(formGroup: FormGroup, control: any, rules: any) {
  const formControl: any = formGroup.get(control);

  if (formControl) {
    const validator = formControl.validator && formControl.validator(new FormControl());
    if (validator && validator[rules]) {
      return true;
    }
  }

  return false;
}

export function getFormGroupArray(formGroup: FormGroup, type: any) {
  return (formGroup.get(type) as FormArray).controls;
}

export function removeFormGroupArrRow(formGroup: FormGroup, type: any, index: number) {
  const control = <FormArray>formGroup.get(type);
  control.removeAt(index);
}

export function removeAllStringUnderscrore(str: String) {
  return str.replace(/_/g, ' ')
}

export function getTableSerialNumber(index: number, TableLength: number, currentPage: number) {
  return currentPage == 1 ? (index + 1) : (TableLength * (currentPage - 1)) + (index + 1)
}

export function resetTableOptions() {
  return {
    page: 1,
    limit: 10,
    pagingCounter: 0,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  }
}
