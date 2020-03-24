import React from 'react'

const ThemeContext = React.createContext()

export const ThemeProvider = ThemeContext.Provider
export const ThemeConsumer = ThemeContext.Consumer

const TextContext = React.createContext()

export const TextProvider = TextContext.Provider
export const TextConsumer = TextContext.Consumer
