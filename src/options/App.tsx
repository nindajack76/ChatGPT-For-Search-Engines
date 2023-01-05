import { CssBaseline, GeistProvider, Radio, Text } from '@geist-ui/core'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import '../base.css'
import { getUserConfig, Theme, TriggerMode, TRIGGER_MODE_TEXT, updateUserConfig } from '../config'
import logo from '../logo.png'
import { detectSystemColorScheme } from '../utils'

function OptionsPage(props: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [triggerMode, setTriggerMode] = useState<TriggerMode>(TriggerMode.Always)

  useEffect(() => {
    getUserConfig().then((config) => setTriggerMode(config.triggerMode))
  }, [])

  const onTriggerModeChange = useCallback((mode: TriggerMode) => {
    setTriggerMode(mode)
    updateUserConfig({ triggerMode: mode })
  }, [])

  const onThemeChange = useCallback(
    (theme: Theme) => {
      updateUserConfig({ theme })
      props.onThemeChange(theme)
    },
    [props],
  )

  return (
    <div className="container mx-auto">
      {/* <nav className="flex flex-row justify-between items-center mt-5 px-2">
        <div className="flex flex-row items-center gap-2">
          <img src={logo} className="w-10 h-10 rounded-lg" />
          <span className="font-semibold">ChatGPT for Google</span>
        </div>
        <div className="flex flex-row gap-3">
          <a
            href="https://chatgpt-for-google.canny.io/feature-requests"
            target="_blank"
            rel="noreferrer"
          >
            Feedback
          </a>
          <a href="https://chatgpt-for-google.canny.io/changelog" target="_blank" rel="noreferrer">
            Changelog
          </a>
          <a
            href="https://github.com/nindajack76/ChatGPT-For-Search-Engines"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </div>
      </nav> */}
      <main className="w-[500px] mx-auto mt-14">
        <Text h2>Options</Text>
        <Text h3 className="mt-10">
          Trigger Mode
        </Text>
        <Radio.Group
          value={triggerMode}
          onChange={(val) => onTriggerModeChange(val as TriggerMode)}
        >
          {Object.entries(TRIGGER_MODE_TEXT).map(([value, label]) => {
            return (
              <Radio key={value} value={value}>
                {label}
              </Radio>
            )
          })}
        </Radio.Group>
        <Text h3 className="mt-10">
          Theme
        </Text>
        <Radio.Group value={props.theme} onChange={(val) => onThemeChange(val as Theme)}>
          {Object.entries(Theme).map(([k, v]) => {
            return (
              <Radio key={v} value={v}>
                {k}
              </Radio>
            )
          })}
        </Radio.Group>
      </main>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(Theme.Auto)

  const themeType = useMemo(() => {
    if (theme === Theme.Auto) {
      return detectSystemColorScheme()
    }
    return theme
  }, [theme])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme))
  }, [])

  return (
    <GeistProvider themeType={themeType}>
      <CssBaseline />
      <OptionsPage theme={theme} onThemeChange={setTheme} />
    </GeistProvider>
  )
}

export default App
