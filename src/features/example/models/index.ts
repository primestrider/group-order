export enum ExamplePageName {
  EXAMPLE = "Example",
  EXAMPLE_FORM = "ExampleForm",
  EXAMPLE_TANSTACK = "EXAMPLE_TANSTACK",
}

export type FeatureARequestPayload = {
  name: string
}

export type ExampleUser = {
  name: string
  age: number
  isLogin: boolean
}

export type ExampleTodo = {
  id: number
  title: string
  done: boolean
}
