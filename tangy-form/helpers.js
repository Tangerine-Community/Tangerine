import { TangyFormResponseModel } from './tangy-form-response-model'

function get(name) { 
  return this.tangyFormResponseModel.get(name)
}

export function Get(response, name = '') {
  const tangyFormResponseModel = new TangyFormResponseModel(response)
  if (name) {
    return tangyFormResponseModel.get(name)
  } else {
    return get.bind({ tangyFormResponseModel })
  }
}

function set(name, value) { 
  this.tangyFormResponseModel.set(name, value)
  return this.tangyFormResponseModel
}

export function Set(response, name = '', value = '') {
  const tangyFormResponseModel = new TangyFormResponseModel(response)
  if (name) {
    tangyFormResponseModel.set(name, value)
    return tangyFormResponseModel
  } else {
    return set.bind({ tangyFormResponseModel })
  }
}